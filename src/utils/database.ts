
export function constructMongoURL({ cluster, databaseName, username, password }: { cluster: string; databaseName: string; username: string; password: string; }) {
	return 'mongodb+srv://<dbUser>:<dbPassword>@<dbCluster>.mongodb.net/<dbName>?retryWrites=true&w=majority'
		.replace('<dbCluster>', cluster)
		.replace('<dbName>', databaseName)
		.replace('<dbUser>', username)
		.replace('<dbPassword>', password);
}