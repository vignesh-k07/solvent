use anchor_lang::prelude::*;

declare_id!("AkGXFCnWivhLPY3qAY9973BV2XCLBv9UZKYM3YyENmV3");

#[program]
pub mod solvent_fundraiser {
    use super::*;

    pub fn initialize_global_pool(ctx: Context<InitializeGlobalPool>, total_matching_funds: u64) -> Result<()> {
        let global_pool = &mut ctx.accounts.global_pool;
        global_pool.total_funds = total_matching_funds;
        global_pool.matchers = vec![]; // Initialize with an empty vector
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

        // Set up the new campaign
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

        // You may want to manage the campaign list differently if needed.
        // For example, you can have a global account that tracks all campaigns.

        Ok(())
    }

    pub fn donate_to_campaign(ctx: Context<DonateToCampaign>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let donor = &mut ctx.accounts.donor;
        let global_pool = &mut ctx.accounts.global_pool;

        // Validate campaign status and donation amount
        require!(campaign.status == CampaignStatus::Active, ErrorCode::CampaignInactive);
        require!(amount > 0, ErrorCode::InvalidDonationAmount);

        // Ensure the donor has sufficient funds
        let donor_lamports = **donor.to_account_info().lamports.borrow();
        require!(donor_lamports >= amount, ErrorCode::InsufficientFunds);

        // Update campaign state
        campaign.donators.push(donor.key());
        campaign.donations.push(amount);
        campaign.amount_collected += amount;

        // Inline matching logic
        let mut matched_amount = 0;
        let mut remaining_amount = amount;

        for matcher in &mut global_pool.matchers {
            if remaining_amount <= matcher.unmatched_funds {
                let donated_amount = remaining_amount.min(matcher.unmatched_funds);
                campaign.total_matched += donated_amount;
                matcher.unmatched_funds -= donated_amount;
                matched_amount += donated_amount;
                break; // Exit the loop if the donation amount is fully matched
            } else {
                let donated_amount = matcher.unmatched_funds;
                campaign.total_matched += donated_amount;
                matcher.unmatched_funds = 0;
                matched_amount += donated_amount;
                remaining_amount -= donated_amount; // Reduce the remaining amount to match
            }
        }

        // Update campaign's total amount with matched funds
        let total_amount = amount + matched_amount;
        campaign.amount_collected += matched_amount;

        // Transfer funds to the campaign owner
        let owner_account = &mut ctx.accounts.owner;
        **owner_account.to_account_info().lamports.borrow_mut() += total_amount;
        **donor.to_account_info().lamports.borrow_mut() -= amount;

        // Adjust the Global Pool's total funds
        global_pool.total_funds -= matched_amount;

        Ok(())
    }

    pub fn commit_funds(ctx: Context<CommitFunds>, amount: u64) -> Result<()> {
        let matcher = &mut ctx.accounts.matcher;
        let payer = &ctx.accounts.payer;
        let global_pool = &mut ctx.accounts.global_pool;

        // Ensure the payer has sufficient funds
        let payer_lamports = **payer.to_account_info().lamports.borrow();
        require!(payer_lamports >= amount, ErrorCode::InsufficientFunds);

        // Find or create the matcher in the global pool
        let mut existing_matcher = None;

        // Check if the matcher already exists
        for m in &mut global_pool.matchers {
            if m.owner == matcher.owner {
                existing_matcher = Some(m);
                break; // Exit loop if matcher is found
            }
        }

        // If not found, create a new matcher
        if existing_matcher.is_none() {
            let new_matcher = Matcher {
                owner: matcher.owner,
                total_contributed: 0,
                unmatched_funds: 0,
            };
            global_pool.matchers.push(new_matcher); // Add new matcher to the list
            existing_matcher = Some(global_pool.matchers.last_mut().unwrap()); // Get the newly created matcher
        }

        // Update the matcher's unmatched funds
        if let Some(matcher) = existing_matcher {
            matcher.unmatched_funds += amount;
        }

        // Transfer funds from the payer to the global pool
        **payer.to_account_info().lamports.borrow_mut() -= amount;
        **global_pool.to_account_info().lamports.borrow_mut() += amount;
        global_pool.total_funds += amount;

        Ok(())
    }

    pub fn mark_inactive(ctx: Context<MarkInactive>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let owner = &mut ctx.accounts.owner;

        require!(owner.key() == campaign.owner, ErrorCode::NotOwner);
        require!(campaign.status == CampaignStatus::Active, ErrorCode::CampaignAlreadyInactive);
        
        campaign.status = CampaignStatus::Inactive;

        Ok(())
    }

    pub fn withdraw_funds(ctx: Context<WithdrawFunds>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let owner = &mut ctx.accounts.owner;

        require!(owner.key() == campaign.owner, ErrorCode::NotOwner);
        require!(campaign.status == CampaignStatus::Inactive || campaign.status == CampaignStatus::Completed, ErrorCode::CannotWithdraw);

        let lamports = campaign.amount_collected;
        campaign.amount_collected = 0;

        **owner.to_account_info().lamports.borrow_mut() += lamports;
        **campaign.to_account_info().lamports.borrow_mut() -= lamports;

        Ok(())
    }

    pub fn withdraw_unmatched_funds(ctx: Context<WithdrawUnmatchedFunds>) -> Result<()> {
        let matcher = &mut ctx.accounts.matcher;
        let owner = &mut ctx.accounts.owner;
        let global_pool = &mut ctx.accounts.global_pool;

        require!(owner.key() == matcher.owner, ErrorCode::NotOwner);
        let unmatched_funds = matcher.unmatched_funds;

        require!(unmatched_funds > 0, ErrorCode::NoUnmatchedFunds);

        matcher.unmatched_funds = 0; // Reset unmatched funds

        **owner.to_account_info().lamports.borrow_mut() += unmatched_funds;
        **matcher.to_account_info().lamports.borrow_mut() -= unmatched_funds;
        **global_pool.to_account_info().lamports.borrow_mut() -= unmatched_funds;
        global_pool.total_funds -= unmatched_funds;

        Ok(())
    }

    pub fn get_campaigns(ctx: Context<GetCampaigns>) -> Result<Vec<Pubkey>> {
        let campaign_list = &ctx.accounts.campaign_list; // Access the campaign list account
        Ok(campaign_list.campaigns.clone()) // Return a clone of the campaigns vector
    }
}

#[derive(Accounts)]
pub struct InitializeGlobalPool<'info> {
    #[account(init, payer = payer, space = 8 + 8 + (32 * 100))] // Space for total_funds and matchers
    pub global_pool: Account<'info, GlobalPool>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeCampaignList<'info> {
    #[account(init, payer = payer, space = 8 + 32 * 100)] // Adjust space as needed
    pub campaign_list: Account<'info, CampaignList>,
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
    pub global_pool: Account<'info, GlobalPool>, // The global pool account
    /// CHECK: The owner of the campaign account is provided by the user and is expected to be valid.
    #[account(mut)]
    pub owner: AccountInfo<'info>, // The owner of the campaign
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CommitFunds<'info> {
    #[account(mut)]
    pub matcher: Account<'info, Matcher>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub global_pool: Account<'info, GlobalPool>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MarkInactive<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    /// CHECK: The owner of the campaign account is provided by the user and is expected to be valid.
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawFunds<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    /// CHECK: The owner of the campaign account is provided by the user and is expected to be valid.
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawUnmatchedFunds<'info> {
    #[account(mut)]
    pub matcher: Account<'info, Matcher>,
    /// CHECK: The owner of the matcher account is provided by the user and is expected to be valid.
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub global_pool: Account<'info, GlobalPool>,
}

#[derive(Accounts)]
pub struct GetCampaigns<'info> {
    #[account(mut)]
    pub campaign_list: Account<'info, CampaignList>, // The account that holds the list of campaigns
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
    pub total_matched: u64, // Total matched amount
    pub image: String,
    pub donators: Vec<Pubkey>,
    pub donations: Vec<u64>,
    pub status: CampaignStatus,
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
    pub matchers: Vec<Matcher>, // List of matchers
}

#[account]
pub struct CampaignList {
    pub campaigns: Vec<Pubkey>, // Vector to hold campaign public keys
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum CampaignStatus {
    Active,
    Inactive,
    Completed,
}

// Define custom error codes
#[error_code]
pub enum ErrorCode {
    #[msg("You must be the owner of the campaign to withdraw funds.")]
    NotOwner,
    #[msg("The campaign is currently inactive or completed.")]
    CampaignInactive,
    #[msg("The campaign is already inactive.")]
    CampaignAlreadyInactive, // New error for already inactive campaign
    #[msg("You cannot withdraw funds until the campaign is inactive or completed.")]
    CannotWithdraw,
    #[msg("Invalid donation amount. Amount must be greater than zero.")]
    InvalidDonationAmount,
    #[msg("Insufficient funds to make the donation.")]
    InsufficientFunds,
    #[msg("No unmatched funds available to withdraw.")]
    NoUnmatchedFunds,
}
