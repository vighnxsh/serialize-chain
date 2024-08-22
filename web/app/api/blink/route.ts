import { ActionGetResponse, ACTIONS_CORS_HEADERS, ActionPostRequest, ActionPostResponse } from '@solana/actions';

export function GET(req: Request) {
  
  const response : ActionGetResponse = {
    icon: 'https://blink.so/favicon.ico',
    title: 'Blink title',
    description: 'Blink description',
    label: 'Blink label',
    error : {
        message: 'Blink error',
    }
  }
  
 return Response.json(response , {
    headers: ACTIONS_CORS_HEADERS
 })
   
}


export async function POST(req: Request) {
   
   const postReq : ActionPostRequest = await req.json();
   const userPubkey = postReq.account;
   console.log(userPubkey);

   
    const response : ActionPostResponse = {
        transaction: 'Blink transaction',
        message: `Hello ${userPubkey}`,
        
    }

    return Response.json(response , {
        headers: ACTIONS_CORS_HEADERS
    });
}
