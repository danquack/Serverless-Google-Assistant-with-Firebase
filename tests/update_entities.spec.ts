import {Entity} from "../deployment/update_entities";
import {expect} from "chai";
import "mocha";

describe("Entity", () => {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        it("should load entity component", async () => {
            expect(new Entity().projectId).to.undefined;
        });
    }
});
