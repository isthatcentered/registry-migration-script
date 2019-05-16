import dotenv from "dotenv"
import { google } from "googleapis" // https://www.npmjs.com/package/google-auth-library



dotenv.config()

console.log( "hello world" )


// Carefull Google auth reads a "GOOGLE_APPLICATION_CREDENTIALS" env var that is the path to your credentials.json file
async function main()
{
	
	return google.auth.getClient( {
			scopes: "https://www.googleapis.com/auth/spreadsheets",
		} )
		.then( jwt => {
			google.sheets( {
				version: "v4",
				auth:    jwt,
			} ).spreadsheets.values.get( {
					spreadsheetId: "1kJlrQlonNsswyDBDpJn6z00ESN_ZjX8H7TuaUqGbyHo",
					range:         "Sheet1",
				} )
				.then( res => res.data )
				.then( console.log )
		} )
}


main()
	.catch( console.error );


// import { google } from "googleapis";
// import { auth } from "./auth";
//
//
//
//
// const sheetsApi = google.sheets( { version: "v4" } );
//
//
// export async function readSheet<T>(
// 	spreadsheetId: string,
// 	range: string,
// 	firstRowAsKeys?: true,
// ): Promise<T[]>;
// export async function readSheet<T>( spreadsheetId: string, range: string, firstRowAsKeys: boolean = true ): Promise<T[] | string[][]>;
// {
// 	const {
// 		      data: {
// 			            values: [ keys, ...values ],
// 		            },
// 	      } = await sheetsApi.spreadsheets.values.get( {
// 		auth:              await auth(),
// 		spreadsheetId,
// 		range,
// 		valueRenderOption: "UNFORMATTED_VALUE",
// 	} );
//
// 	return firstRowAsKeys
// 	       ?
// 	       values.map( columns =>
// 		       keys.reduce(
// 			       ( acc, key, idx ) => ({
// 				       ...acc,
// 				       [ key ]: columns[ idx ],
// 			       }),
// 			       {} as T,
// 		       ),
// 	       )
// 	       :
// 	       [ keys, ...values ];
// }