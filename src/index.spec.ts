beforeEach( () => jest.resetAllMocks() )

describe( `Migration`, () => {
	test( `Sets up every requirement for migration`, () => {
		const repository: SetupAble = { setup: jest.fn().mockResolvedValue( null ) },
		      team: SetupAble       = { setup: jest.fn().mockResolvedValue( null ) },
		      namespace: SetupAble  = { setup: jest.fn().mockResolvedValue( null ) }
		
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
	
	
	test( `Logs when setup startegy fails`, () => {
		const spy                              = jest.spyOn( console, "log" ),
		      ERROR                            = "some_error_thrown_by_strategy",
		      startegy: Strategy<Promise<any>> = { execute: jest.fn().mockRejectedValue( { message: ERROR } ) }
		
		;(new Setupable( startegy )).setup()
		
		expect( spy ).toHaveBeenCalledWith( ERROR )
	} )
} )

describe( `JfrogTeam`, () => {
	const jfrogService: JfrogService = { createTeam: jest.fn() }
	
	describe( `Non existing team`, () => {
		beforeEach( () => (jfrogService.createTeam as jest.Mock).mockResolvedValue( null ) )
		
		test( `Creates team in artifactory`, () => {
			const teamConfig: configInfo = makeTeamConfig( { exists: false } )
			
			new JfrogTeam( teamConfig, jfrogService ).setup()
			
			expect( jfrogService.createTeam ).toHaveBeenCalledWith( teamConfig.name )
		} )
	} )
	
	
	describe( `Existing team`, () => {
		test( `Does nothing`, () => {
			const teamConfig: configInfo = makeTeamConfig( { exists: true } )
			
			new JfrogTeam( teamConfig, jfrogService ).setup()
			
			expect( jfrogService.createTeam ).not.toHaveBeenCalled()
		} )
	} )
	
	describe( `Service call error`, () => {
		beforeEach( () => (jfrogService.createTeam as jest.Mock).mockRejectedValue( null ) )
		
		test( `Logs the error`, () => {
			const teamConfig: configInfo = makeTeamConfig( { exists: false } )
			
			return (new JfrogTeam( teamConfig, jfrogService ))
				.setup()
				.catch( ( { message } ) =>
					expect( message.toLowerCase() ).toContain( `failed creating team with name "${teamConfig.name}"` ) )
				.finally( () => expect.hasAssertions() )
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

interface JfrogService
{
	createTeam( name: string ): Promise<void>
}

interface configInfo
{
	name: string;
	exists: boolean
}

interface WorldConfig
{
	jfrog: {
		team: configInfo;
		repository: configInfo
	}
	vault: {
		namespace: configInfo
	}
	admin: LDAP
}

export interface SetupAble
{
	setup(): Promise<void>
}

export interface Strategy<T>
{
	execute(): T
}

export class Setupable implements SetupAble
{
	
	constructor( private _strategy: Strategy<Promise<any>> )
	{
	}
	
	
	setup(): Promise<void>
	{
		return this._strategy.execute()
			.catch( ( { message } ) => console.log( message ) )
	}
}

class Migration implements SetupAble
{
	constructor( private _repository: SetupAble, private _team: SetupAble, private _namespace: SetupAble )
	{
	}
	
	
	setup(): Promise<void>
	{
		return this._team.setup()
			.then( () => this._repository.setup() )
			.then( () => this._namespace.setup() )
	}
}


// @todo: this becomes a strategy and won't inherit from setupable
class JfrogRepository implements SetupAble
{
	constructor( config: configInfo )
	{
	}
	
	
	setup(): Promise<void>
	{
		return Promise.resolve()
	}
}

class JfrogTeam implements SetupAble
{
	private __exists: boolean
	private __name: string
	
	
	constructor( { name, exists }: configInfo, private _jfrogService: JfrogService )
	{
		this.__name = name
		this.__exists = exists
	}
	
	
	setup(): Promise<void>
	{
		if ( this.__exists )
			return Promise.resolve()
		
		return this._jfrogService.createTeam( this.__name )
			.catch( () => {
				throw new Error( `Failed creating team with name "${this.__name}"` )
			} )
	}
}

class VaultNamespace implements SetupAble
{
	
	constructor( config: configInfo )
	{
	}
	
	
	setup(): Promise<void>
	{
		return Promise.resolve()
	}
}

class LDAP
{
	constructor( public value: number )
	{
	}
}

