use anchor_lang::prelude::*;

declare_id!("AkGXFCnWivhLPY3qAY9973BV2XCLBv9UZKYM3YyENmV3");

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

        campaign.owner = payer.key(); // Assign the owner's public key
        campaign.title = title;
        campaign.description = description;
        campaign.target = target;
        campaign.deadline = deadline;
        campaign.amount_collected = 0;
        campaign.total_matched = 0;
        campaign.image = image;
        campaign.donators = vec![];
        campaign.donations = vec![];

        // Set status as "active"
        campaign.status = "active".to_string(); 

        Ok(())
    }

    pub fn donate_to_campaign(ctx: Context<DonateToCampaign>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let donor = &mut ctx.accounts.donor;
        let global_pool = &mut ctx.accounts.global_pool;

        require!(campaign.status == "active", ErrorCode::CampaignInactive);
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

        Ok(())
    }

    pub fn mark_inactive(ctx: Context<MarkInactive>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let owner = &mut ctx.accounts.owner;

        require!(owner.key() == campaign.owner, ErrorCode::NotOwner);
        require!(campaign.status == "active", ErrorCode::CampaignAlreadyInactive);

        campaign.status = "inactive".to_string();
        Ok(())
    }

    pub fn withdraw_funds(ctx: Context<WithdrawFunds>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let owner = &mut ctx.accounts.owner;

        require!(owner.key() == campaign.owner, ErrorCode::NotOwner);
        require!(campaign.status == "inactive" || campaign.status == "completed", ErrorCode::CannotWithdraw);

        let lamports = campaign.amount_collected;
        campaign.amount_collected = 0;

        **owner.to_account_info().lamports.borrow_mut() += lamports;
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
pub struct MarkInactive<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    /// CHECK: The owner of the campaign account is provided by the user and is expected to be valid.
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawFunds<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    /// CHECK: The owner of the campaign account is provided by the user and is expected to be valid.
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawUnmatchedFunds<'info> {
    #[account(mut)]
    pub matcher: Account<'info, Matcher>,
    #[account(mut)]
    /// CHECK: The owner of the matcher account is provided by the user and is expected to be valid.
    pub owner: Signer<'info>,
    #[account(mut)]
    pub global_pool: Account<'info, GlobalPool>,
}

#[account]
pub struct Campaign {
    /// CHECK: The owner of the campaign account is provided by the user and is expected to be valid.
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
    pub status: String, // Campaign status as a string
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

#[error_code]
pub enum ErrorCode {
    #[msg("You must be the owner of the campaign to withdraw funds.")]
    NotOwner,
    #[msg("The campaign is currently inactive or completed.")]
    CampaignInactive,
    #[msg("The campaign is already inactive.")]
    CampaignAlreadyInactive,
    #[msg("You cannot withdraw funds until the campaign is inactive or completed.")]
    CannotWithdraw,
    #[msg("Invalid donation amount. Amount must be greater than zero.")]
    InvalidDonationAmount,
    #[msg("Insufficient funds to make the donation.")]
    InsufficientFunds,
    #[msg("No unmatched funds available to withdraw.")]
    NoUnmatchedFunds,
}