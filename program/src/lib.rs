use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("7DXPpkN3YFh6pjAWQJfhiBSXnwWhVJEbHRQy2MFPdx4H");

#[program]
pub mod world_strategy {
    use super::*;

    /// Initialize the treasury account
    pub fn initialize_treasury(
        ctx: Context<InitializeTreasury>,
        authority: Pubkey,
    ) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.admin = authority;
        treasury.total_fees_collected = 0;
        treasury.total_deployed = 0;
        treasury.paused = false;
        treasury.last_allocation_timestamp = Clock::get()?.unix_timestamp;
        treasury.last_nav_update_timestamp = Clock::get()?.unix_timestamp;

        emit!(TreasuryInitialized {
            admin: authority,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Record fees received by the treasury
    pub fn record_fees(ctx: Context<RecordFees>, amount: u64) -> Result<()> {
        require!(!ctx.accounts.treasury.paused, TreasuryError::Paused);

        let treasury = &mut ctx.accounts.treasury;
        treasury.total_fees_collected = treasury
            .total_fees_collected
            .checked_add(amount)
            .ok_or(TreasuryError::ArithmeticOverflow)?;

        emit!(FeesReceived {
            amount,
            timestamp: Clock::get()?.unix_timestamp,
            tx_hash: format!("{:?}", ctx.accounts.signer.key()),
        });

        Ok(())
    }

    /// Execute allocation (admin or keeper bot)
    pub fn execute_allocation(
        ctx: Context<ExecuteAllocation>,
        allocations: Vec<AssetAllocation>,
    ) -> Result<()> {
        require!(!ctx.accounts.treasury.paused, TreasuryError::Paused);

        // Validate allocations sum correctly
        let mut total: u64 = 0;
        for alloc in allocations.iter() {
            total = total
                .checked_add(alloc.amount_deployed_usdc)
                .ok_or(TreasuryError::ArithmeticOverflow)?;
        }

        let treasury = &mut ctx.accounts.treasury;

        // Update treasury state
        treasury.total_deployed = treasury
            .total_deployed
            .checked_add(total)
            .ok_or(TreasuryError::ArithmeticOverflow)?;
        treasury.last_allocation_timestamp = Clock::get()?.unix_timestamp;

        emit!(AllocationExecuted {
            timestamp: Clock::get()?.unix_timestamp,
            allocations: allocations.clone(),
            total_allocated: total,
        });

        Ok(())
    }

    /// Update NAV (keeper bot)
    pub fn update_nav(
        ctx: Context<UpdateNAV>,
        nav_per_token: f64,
        total_treasury_usd: f64,
        circulating_supply: u64,
    ) -> Result<()> {
        require!(nav_per_token > 0.0, TreasuryError::InvalidNAV);
        require!(total_treasury_usd >= 0.0, TreasuryError::InvalidNAV);

        let treasury = &mut ctx.accounts.treasury;
        treasury.last_nav_update_timestamp = Clock::get()?.unix_timestamp;

        emit!(NAVUpdated {
            nav_per_token,
            total_treasury_usd,
            circulating_supply,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Pause treasury (admin only)
    pub fn pause_treasury(ctx: Context<PauseTreasury>) -> Result<()> {
        require_eq!(
            ctx.accounts.admin.key(),
            ctx.accounts.treasury.admin,
            TreasuryError::Unauthorized
        );

        ctx.accounts.treasury.paused = true;

        emit!(TreasuryPaused {
            admin: ctx.accounts.admin.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Unpause treasury (admin only)
    pub fn unpause_treasury(ctx: Context<UnpauseTreasury>) -> Result<()> {
        require_eq!(
            ctx.accounts.admin.key(),
            ctx.accounts.treasury.admin,
            TreasuryError::Unauthorized
        );

        ctx.accounts.treasury.paused = false;

        emit!(TreasuryUnpaused {
            admin: ctx.accounts.admin.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Update admin (admin only)
    pub fn update_admin(ctx: Context<UpdateAdmin>, new_admin: Pubkey) -> Result<()> {
        require_eq!(
            ctx.accounts.admin.key(),
            ctx.accounts.treasury.admin,
            TreasuryError::Unauthorized
        );

        ctx.accounts.treasury.admin = new_admin;

        emit!(AdminUpdated {
            previous_admin: ctx.accounts.admin.key(),
            new_admin,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

// ============================================================================
// Accounts
// ============================================================================

#[account]
pub struct Treasury {
    pub admin: Pubkey,
    pub paused: bool,
    pub total_fees_collected: u64,
    pub total_deployed: u64,
    pub last_allocation_timestamp: i64,
    pub last_nav_update_timestamp: i64,
}

// ============================================================================
// Contexts
// ============================================================================

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 1 + 8 + 8 + 8 + 8
    )]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordFees<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteAllocation<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateNAV<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct PauseTreasury<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct UnpauseTreasury<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateAdmin<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    pub admin: Signer<'info>,
}

// ============================================================================
// Types
// ============================================================================

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct AssetAllocation {
    pub asset_id: String,
    pub amount_deployed_usdc: u64,
    pub amount_received: u64,
    pub slippage_bps: u16,
}

// ============================================================================
// Events
// ============================================================================

#[event]
pub struct TreasuryInitialized {
    pub admin: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct FeesReceived {
    pub amount: u64,
    pub timestamp: i64,
    pub tx_hash: String,
}

#[event]
pub struct AllocationExecuted {
    pub timestamp: i64,
    pub allocations: Vec<AssetAllocation>,
    pub total_allocated: u64,
}

#[event]
pub struct NAVUpdated {
    pub nav_per_token: f64,
    pub total_treasury_usd: f64,
    pub circulating_supply: u64,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryPaused {
    pub admin: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryUnpaused {
    pub admin: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct AdminUpdated {
    pub previous_admin: Pubkey,
    pub new_admin: Pubkey,
    pub timestamp: i64,
}

// ============================================================================
// Errors
// ============================================================================

#[error_code]
pub enum TreasuryError {
    #[msg("Treasury is paused")]
    Paused,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Invalid NAV")]
    InvalidNAV,
    #[msg("Invalid allocation")]
    InvalidAllocation,
}
