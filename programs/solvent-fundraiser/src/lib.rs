use anchor_lang::prelude::*;

declare_id!("6KS28d7UV7LEJvEYpzj8QRcwAJbLhp4FFMvyHmVEuBLR");

#[program]
pub mod crowdfunding {
    use super::*;

    // Function to create a new campaign
    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        title: String,
        description: String,
        target_amount: u64,
        image: String,
    ) -> Result<()> {
        // Validate inputs
        if target_amount == 0 {
            return Err(ErrorCode::InvalidTargetAmount.into());
        }
        if title.len() > 100 {  // Updated maximum length for title
            return Err(ErrorCode::TitleTooLong.into());
        }
        if description.len() > 5000 {  // Updated maximum length for description
            return Err(ErrorCode::DescriptionTooLong.into());
        }
        if image.len() > 256 {  // Updated maximum length for image URL
            return Err(ErrorCode::ImageTooLong.into());
        }

        let campaign = &mut ctx.accounts.campaign;
        campaign.title = title;
        campaign.description = description;
        campaign.target_amount = target_amount;
        campaign.current_amount = 0;
        campaign.status = CampaignStatus::Active;
        campaign.creator = *ctx.accounts.creator.key;
        campaign.image = image;

        Ok(())
    }

    // Function to retrieve and log the details of a specific campaign
    pub fn get_campaign(ctx: Context<GetCampaign>) -> Result<()> {
        let campaign = &ctx.accounts.campaign;
        msg!("Campaign Title: {}", campaign.title);
        msg!("Campaign Description: {}", campaign.description);
        msg!("Target Amount: {}", campaign.target_amount);
        msg!("Current Amount: {}", campaign.current_amount);
        msg!("Status: {:?}", campaign.status);
        msg!("Creator: {}", campaign.creator);
        msg!("Image URL/Base64: {}", campaign.image);

        Ok(())
    }
}

// Define the Campaign struct
#[account]
pub struct Campaign {
    pub title: String,
    pub description: String,
    pub target_amount: u64,
    pub current_amount: u64,
    pub status: CampaignStatus,
    pub creator: Pubkey,
    pub image: String,
}

impl Campaign {
    // Updated space requirement for the Campaign struct
    pub const ACCOUNT_SIZE: usize = 8 +  // Discriminator
                                    4 + 100 + // title: String (4 bytes for length + 100 bytes max)
                                    4 + 5000 + // description: String (4 bytes for length + 5000 bytes max)
                                    8 +  // target_amount: u64
                                    8 +  // current_amount: u64
                                    1 +  // status: CampaignStatus (u8)
                                    32 + // creator: Pubkey
                                    4 + 256; // image: String (4 bytes for length + 256 bytes max)
}

// Define the CampaignStatus enum
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum CampaignStatus {
    Active,
    Inactive,
    Completed,
}

// Define the accounts context for creating a campaign
#[derive(Accounts)]
pub struct CreateCampaign<'info> {
    #[account(init, payer = creator, space = Campaign::ACCOUNT_SIZE)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,  // Ensure system_program is included
}

// Define the accounts context for retrieving a campaign
#[derive(Accounts)]
pub struct GetCampaign<'info> {
    pub campaign: Account<'info, Campaign>,
}

// Define error codes
#[error_code]
pub enum ErrorCode {
    #[msg("The target amount must be greater than 0.")]
    InvalidTargetAmount,
    #[msg("The title is too long.")]  // New error code for title length
    TitleTooLong,
    #[msg("The description is too long.")]  // New error code for description length
    DescriptionTooLong,
    #[msg("The image URL is too long.")]  // New error code for image length
    ImageTooLong,
}