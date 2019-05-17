export interface Setupable
{
	setup(): Promise<void>
}

export interface Strategy<T>
{
	execute(): T
}

export class FromStrategySetupable implements Setupable
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

export class Migration implements Setupable
{
	constructor( private _repository: Setupable, private _team: Setupable, private _namespace: Setupable )
	{
	}
	
	
	setup(): Promise<void>
	{
		return this._team.setup()
			.then( () => this._repository.setup() )
			.then( () => this._namespace.setup() )
	}
}

export class LDAP
{
	constructor( public value: number )
	{
	}
}

export interface JfrogService
{
	createTeam( name: string ): Promise<void>
}

export interface configInfo
{
	name: string;
	exists: boolean
}

export interface WorldConfig
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