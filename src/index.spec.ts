import { configInfo, FromStrategySetupable, JfrogService, Migration, Setupable, Strategy } from "./models"




export class CreateJfrogTeam implements Strategy<void>
{
	private __exists: boolean
	private __name: string
	
	
	constructor( { name, exists }: configInfo, private _jfrogService: JfrogService )
	{
		this.__name = name
		this.__exists = exists
	}
	
	
	execute(): Promise<void>
	{
		if ( this.__exists )
			return Promise.resolve()
		
		return this._jfrogService.createTeam( this.__name )
			.catch( () => {
				throw new Error( `Failed creating team with name "${this.__name}"` )
			} )
	}
}

beforeEach( () => jest.resetAllMocks() )

describe( `Migration`, () => {
	test( `Sets up every requirement for migration`, () => {
		const repository: Setupable = { setup: jest.fn().mockResolvedValue( null ) },
		      team: Setupable       = { setup: jest.fn().mockResolvedValue( null ) },
		      namespace: Setupable  = { setup: jest.fn().mockResolvedValue( null ) }
		
		const migration = new Migration( repository, team, namespace )
		
		return migration.setup()
			.then( () => {
				expect( repository.setup ).toHaveBeenCalled()
				expect( team.setup ).toHaveBeenCalled()
				expect( namespace.setup ).toHaveBeenCalled()
			} )
			.finally( () => expect.hasAssertions() )
	} )
} )

describe( `Setupable`, () => {
	const consoleSpy: jest.SpyInstance = jest.spyOn( console, "log" )
	
	test( `Logs when setup startegy fails`, async () => {
		const ERROR                            = "some_error_thrown_by_strategy",
		      startegy: Strategy<Promise<any>> = { execute: jest.fn().mockRejectedValue( { message: ERROR } ) }
		
		consoleSpy.mockImplementation( () => null ) // don't actually log this in test console
		
		;(new FromStrategySetupable( startegy )).setup()
		
		await Promise.resolve()
		
		expect( consoleSpy ).toHaveBeenCalledWith( ERROR )
		
		consoleSpy.mockRestore()
	} )
} )

describe( `CreateJfrogTeamStrategy`, () => {
	const jfrogService: JfrogService = { createTeam: jest.fn() }
	
	beforeEach( () => (jfrogService.createTeam as jest.Mock).mockResolvedValue( null ) )
	
	describe( `Non existing team`, () => {
		test( `Calls api to create team`, () => {
			const teamConfig: configInfo = makeTeamConfig( { exists: false } )
			
			new CreateJfrogTeam( teamConfig, jfrogService ).execute()
			
			expect( jfrogService.createTeam ).toHaveBeenCalledWith( teamConfig.name )
		} )
	} )
	
	describe( `Existing team`, () => {
		test( `Doesn't call api`, () => {
			const teamConfig: configInfo = makeTeamConfig( { exists: true } )
			
			new CreateJfrogTeam( teamConfig, jfrogService ).execute()
			
			expect( jfrogService.createTeam ).not.toHaveBeenCalled()
		} )
	} )
	
	describe( `Error`, () => {
		beforeEach( () => (jfrogService.createTeam as jest.Mock).mockResolvedValue( null ) )
		
		test( `Throws a failure containing team name`, () => {
			const teamConfig: configInfo = makeTeamConfig( { exists: true } )
			
			return (new CreateJfrogTeam( teamConfig, jfrogService ).execute())
				.catch( err => expect( err ).toContain( teamConfig.name ) )
		} )
	} )
	
	
	function makeTeamConfig( config: Partial<configInfo> ): configInfo
	{
		return {
			exists: false,
			name:   "team_config",
			...config,
		}
	}
} )


// @todo: jfrog team
// @todo: jfrog repo
// @todo: vault namespace

