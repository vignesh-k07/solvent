use anchor_lang::prelude::*;

declare_id!("5HqykVFF3Gjo3iQYaCkmEQG7zqYaPNZC3nupXA5ndzs8");

#[program]
pub mod solvent_fundraiser {
    use super::*;

    pub fn initialize_global_pool(ctx: Context<InitializeGlobalPool>, total_matching_funds: u64) -> Result<()> {
        let global_pool = &mut ctx.accounts.global_pool;
        global_pool.total_funds = total_matching_funds;
        global_pool.matchers = vec![];

        Ok(())
    }

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        title: String,
        description: String,
        target: u64,
        deadline: i64,
        image: String,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let payer = &ctx.accounts.payer;

        campaign.owner = payer.key();
        campaign.title = title;
        campaign.description = description;
        campaign.target = target;
        campaign.deadline = deadline;
        campaign.amount_collected = 0;
        campaign.total_matched = 0;
        campaign.image = image;
        campaign.donators = vec![];
        campaign.donations = vec![];
        campaign.status = CampaignStatus::Active;
        campaign.next_withdrawal_threshold = target / 4; // Set initial threshold at 25% of the target

        Ok(())
    }

    pub fn donate_to_campaign(ctx: Context<DonateToCampaign>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let donor = &mut ctx.accounts.donor;
        let global_pool = &mut ctx.accounts.global_pool;

        require!(campaign.status == CampaignStatus::Active, ErrorCode::CampaignInactive);
        require!(amount > 0, ErrorCode::InvalidDonationAmount);

        let donor_lamports = **donor.to_account_info().lamports.borrow();
        require!(donor_lamports >= amount, ErrorCode::InsufficientFunds);

        campaign.donators.push(donor.key());
        campaign.donations.push(amount);
        campaign.amount_collected += amount;

        let mut matched_amount = 0;
        let mut remaining_amount = amount;

        for matcher in &mut global_pool.matchers {
            if remaining_amount <= matcher.unmatched_funds {
                let donated_amount = remaining_amount.min(matcher.unmatched_funds);
                campaign.total_matched += donated_amount;
                matcher.unmatched_funds -= donated_amount;
                matched_amount += donated_amount;
                break;
            } else {
                let donated_amount = matcher.unmatched_funds;
                campaign.total_matched += donated_amount;
                matcher.unmatched_funds = 0;
                matched_amount += donated_amount;
                remaining_amount -= donated_amount;
            }
        }

        let total_amount = amount + matched_amount;
        campaign.amount_collected += matched_amount;

        let owner_account = &mut ctx.accounts.owner;
        **owner_account.to_account_info().lamports.borrow_mut() += total_amount;
        **donor.to_account_info().lamports.borrow_mut() -= amount;
        global_pool.total_funds -= matched_amount;

        if campaign.amount_collected >= campaign.target {
            campaign.status = CampaignStatus::Completed;
            emit!(CampaignStatusEvent {
                campaign: campaign.key(),
                status: CampaignStatus::Completed,
            });
        }

        Ok(())
    }

    pub fn withdraw_at_milestone(ctx: Context<WithdrawAtMilestone>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let owner = &mut ctx.accounts.owner;

        require!(owner.key() == campaign.owner, ErrorCode::NotOwner);
        require!(campaign.status == CampaignStatus::Active || campaign.status == CampaignStatus::Inactive, ErrorCode::InvalidStatus);

        if campaign.amount_collected >= campaign.next_withdrawal_threshold {
            let amount_to_withdraw = campaign.next_withdrawal_threshold;
            campaign.next_withdrawal_threshold += campaign.target / 4;

            **owner.to_account_info().lamports.borrow_mut() += amount_to_withdraw;
            emit!(MilestoneWithdrawalEvent {
                campaign: campaign.key(),
                milestone: campaign.next_withdrawal_threshold,
                amount: amount_to_withdraw,
            });

            if campaign.next_withdrawal_threshold > campaign.target {
                campaign.status = CampaignStatus::Completed;
            }
        } else {
            return err!(ErrorCode::InvalidMilestone);
        }

        Ok(())
    }

    pub fn set_campaign_inactive(ctx: Context<SetCampaignInactive>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let owner = &mut ctx.accounts.owner;

        require!(owner.key() == campaign.owner, ErrorCode::NotOwner);
        require!(campaign.status == CampaignStatus::Active, ErrorCode::CannotSetInactive);

        campaign.status = CampaignStatus::Inactive;
        emit!(CampaignStatusEvent {
            campaign: campaign.key(),
            status: CampaignStatus::Inactive,
        });

        Ok(())
    }

    pub fn withdraw_remaining_funds(ctx: Context<WithdrawRemainingFunds>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let owner = &mut ctx.accounts.owner;

        require!(owner.key() == campaign.owner, ErrorCode::NotOwner);
        require!(campaign.status == CampaignStatus::Inactive, ErrorCode::CampaignNotInactive);

        let remaining_amount = campaign.amount_collected;
        require!(remaining_amount > 0, ErrorCode::NoFundsAvailable);

        campaign.amount_collected = 0;
        **owner.to_account_info().lamports.borrow_mut() += remaining_amount;

        emit!(WithdrawFundsEvent {
            campaign: campaign.key(),
            amount: remaining_amount,
        });

        Ok(())
    }

    pub fn withdraw_unmatched_funds(ctx: Context<WithdrawUnmatchedFunds>) -> Result<()> {
        let matcher = &mut ctx.accounts.matcher;
        let owner = &mut ctx.accounts.owner;
        let global_pool = &mut ctx.accounts.global_pool;

        require!(owner.key() == matcher.owner, ErrorCode::NotOwner);
        let unmatched_funds = matcher.unmatched_funds;

        require!(unmatched_funds > 0, ErrorCode::NoUnmatchedFunds);
        matcher.unmatched_funds = 0;

        **owner.to_account_info().lamports.borrow_mut() += unmatched_funds;
        global_pool.total_funds -= unmatched_funds;

        emit!(WithdrawUnmatchedFundsEvent {
            matcher: matcher.key(),
            amount: unmatched_funds,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeGlobalPool<'info> {
    #[account(init, payer = payer, space = 8 + 8 + (32 * 100))]
    pub global_pool: Account<'info, GlobalPool>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateCampaign<'info> {
    #[account(init, payer = payer, space = 8 + 32 + 128 + 8 + 8 + 8 + 128 + (32 * 100) + (8 * 100) + 1)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DonateToCampaign<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub donor: Signer<'info>,
    #[account(mut)]
    pub global_pool: Account<'info, GlobalPool>,
    #[account(mut)]
    /// CHECK: The owner of the campaign account is provided by the user and is expected to be valid.
    pub owner: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct WithdrawAtMilestone<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetCampaignInactive<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawRemainingFunds<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawUnmatchedFunds<'info> {
    #[account(mut)]
    pub matcher: Account<'info, Matcher>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub global_pool: Account<'info, GlobalPool>,
}

#[account]
pub struct Campaign {
    pub owner: Pubkey,
    pub title: String,
    pub description: String,
    pub target: u64,
    pub deadline: i64,
    pub amount_collected: u64,
    pub total_matched: u64,
    pub image: String,
    pub donators: Vec<Pubkey>,
    pub donations: Vec<u64>,
    pub status: CampaignStatus,
    pub next_withdrawal_threshold: u64,
}

#[account]
pub struct Matcher {
    pub owner: Pubkey,
    pub total_contributed: u64,
    pub unmatched_funds: u64,
}

#[account]
pub struct GlobalPool {
    pub total_funds: u64,
    pub matchers: Vec<Matcher>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CampaignStatus {
    Active,
    Inactive,
    Completed,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Campaign is inactive.")]
    CampaignInactive,
    #[msg("Invalid donation amount.")]
    InvalidDonationAmount,
    #[msg("Insufficient funds.")]
    InsufficientFunds,
    #[msg("Not the owner of the campaign.")]
    NotOwner,
    #[msg("Invalid milestone for withdrawal.")]
    InvalidMilestone,
    #[msg("Campaign status is invalid for this operation.")]
    InvalidStatus,
    #[msg("No funds available for withdrawal.")]
    NoFundsAvailable,
    #[msg("Cannot set campaign to inactive from current status.")]
    CannotSetInactive,
    #[msg("Campaign is not inactive.")]
    CampaignNotInactive,
    #[msg("No unmatched funds available for withdrawal.")]
    NoUnmatchedFunds,
}

#[event]
pub struct CampaignStatusEvent {
    pub campaign: Pubkey,
    pub status: CampaignStatus,
}

#[event]
pub struct MilestoneWithdrawalEvent {
    pub campaign: Pubkey,
    pub milestone: u64,
    pub amount: u64,
}

#[event]
pub struct WithdrawFundsEvent {
    pub campaign: Pubkey,
    pub amount: u64,
}

#[event]
pub struct WithdrawUnmatchedFundsEvent {
    pub matcher: Pubkey,
    pub amount: u64,
}
