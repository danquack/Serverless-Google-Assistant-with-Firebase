// Imports
import {
    EntityTypesClient,
    SessionsClient,
    EntityKind,
    EntityType,
    EntityAutoExpansionMode,
    EntitySynonyms
} from "dialogflow";
import {load} from "yamljs";

export class Entity {
    projectId: string;
    sessionsClient: SessionsClient;
    entityTypesClient: EntityTypesClient;

    constructor() {
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            this.sessionsClient = new SessionsClient();
            this.entityTypesClient = new EntityTypesClient();
        } else {
            throw Error("No application credentials set.");
        }
    }

    async listEntityTypes(): Promise < [EntityType[]] > {
        return this.entityTypesClient.listEntityTypes({
            parent: this.entityTypesClient.projectAgentPath(await this.sessionsClient.getProjectId())
        });
    }

    async getName(displayName : string): Promise<string> {
        const currentEntites = await this.listEntityTypes();
        for (let position in currentEntites[0]) {
            const entity: EntityType = currentEntites[0][position];
            if (entity.displayName === displayName) {
                return Promise.resolve(entity.name);
            }
        }
        return Promise.resolve("");
    }

    async createEntity(displayName : string, entities? : EntitySynonyms[]): Promise < [EntityType] > {
        if((await this.getName(displayName)) == "") {
            console.log(`Creating Entity ${displayName}`);
            const entityType: EntityType = {
                name: "",
                entities: entities
                    ? entities
                    : [],
                displayName: displayName,
                kind: "KIND_MAP" as EntityKind,
                autoExpansionMode: "AUTO_EXPANSION_MODE_DEFAULT" as EntityAutoExpansionMode
            };
            return this.entityTypesClient.createEntityType({
                parent: this.entityTypesClient.projectAgentPath(await this.sessionsClient.getProjectId()),
                entityType: entityType
            });
        } else {
            console.log(`${displayName} already exists`);
            return this.updateEntity(displayName, entities);
        }
    }

    async updateEntity(displayName : string, entities? : EntitySynonyms[]): Promise < [EntityType] > {
        console.log(`updating entity ${displayName}`);
        let name = await this.getName(displayName);
        if (name == "") {
            return this.createEntity(displayName, entities);
        }
        return this.entityTypesClient.updateEntityType({
            entityType: {
                name: name,
                entities: entities
                    ? entities
                    : [],
                displayName: displayName,
                kind: "KIND_MAP" as EntityKind,
                autoExpansionMode: "AUTO_EXPANSION_MODE_DEFAULT" as EntityAutoExpansionMode
            }
        });
    }
}

async function loadEntities() {
    // Load Entities from yaml
    let entities: any;
    try {
        entities = await load("../entities.yml");
    } catch (e) {
        console.log(e);
        throw Error("No Entitiies.yml file in parent directory");
    }

    // Loops through YAML and get entities
    for (let positon in entities) {
        const entity = entities[positon];
        const entityName: string = Object.keys(entity)[0].toLowerCase();
        let synoynms: EntitySynonyms[] = [];

        // Loop through each reference and synonyms and update the entities
        for (let outer in entity) {
            if (entity[outer]) {
                try {
                    entity[outer].forEach((item : any) => {
                        const synonym: EntitySynonyms = {
                            value: Object.keys(item)[0],
                            synonyms: item[Object.keys(item)[0]]
                        };
                        synoynms.push(synonym);
                    });
                } catch (e) {
                    // ignore this as it means there are no references
                }
            }
        }
        // Attempt to create an Entity. If update is needed log will report.
        try {
            await new Entity().createEntity(entityName, synoynms);
            console.log("...success");
        } catch (e) {
            console.log("error", e);
            throw e;
        }
    }
}

loadEntities();
