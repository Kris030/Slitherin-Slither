const owner = '<owner_id>';
export default {
	token: '<bot_token>',
	owner,
	statusInterval: -1,
	admins: [ owner ],
	database: {
		baseURL: '<base_url>',
		cluster: '<cluster>',
		databaseName: '<database_name>',
		username: '<username>',
		password: '<password>',
		constructURL(): string {
			return this.baseURL
				.replace('dbCluster', this.cluster)
				.replace('<dbName>', this.databaseName)
				.replace('<dbUser>', this.username)
				.replace('<dbPassword>', this.password);
		},
	},
};