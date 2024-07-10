use anchor_lang::prelude::*;

declare_id!("6M6P1v46crAGqAqC882rTvmpkViGCphNfprXf7tx2L8J");

//setting the public key of the event organizer
#[constant]
pub const EVENT_ORGANIZER : Pubkey = pubkey!("fun8eenPrVMJtiQNE7q1iBVDNuY2Lbnc3x8FFgCt43N");

#[program]
pub mod anchor_solana_pay {
    use super::*;

    //initialize the user state PDA using the Initialize context
    pub fn initialize(ctx: Context<Initialize>, game_id : Pubkey) -> Result<()> {
        //set the User State's user public key as the Initialize context's user's public key
        ctx.accounts.user_state.user = ctx.accounts.user.key();
        ctx.accounts.user_state.game_id = game_id;
        Ok(())
    }

    //update the check-in for the user using the CheckIn context
    pub fn check_in(ctx: Context<CheckIn>, _game_id: Pubkey, location : Pubkey) ->Result<()>{
        ctx.accounts.user_state.last_location = location;
        Ok(())
    }
}

//struct for initialize context for the initialize function -> with the game_id we require
#[derive(Accounts)]
#[instruction(game_id:Pubkey)]
pub struct Initialize<'info>{
    #[account(
        init,
        seeds = [game_id.key().as_ref(),user.key().as_ref()],
        bump,
        payer = user,
        space = 8 + 32 + 32 + 32
    )]
    pub user_state : Account<'info,UserState>,
    #[account(mut)]
    pub user : Signer<'info>,

    //required when initializing a PDA
    pub system_program : Program<'info,System>,
    pub rent : Sysvar<'info,Rent>,
}

//struct for context for checking-in to a location for a user
#[derive(Accounts)]
#[instruction(game_id: Pubkey)]
pub struct CheckIn<'info>{
    #[account(
        mut,
        seeds = [game_id.key().as_ref(),user.key().as_ref()],
        bump,
    )]
    pub user_state : Account<'info,UserState>,
    #[account(mut)]
    pub user : Signer<'info>,
    #[account(address = EVENT_ORGANIZER)]
    
    //the event organizer signs when a new check-in is done
    pub event_organizer : Signer<'info>
}

//public struct of the user state PDA
#[account]
pub struct UserState{
    pub user : Pubkey,
    pub game_id : Pubkey,
    pub last_location : Pubkey
}
