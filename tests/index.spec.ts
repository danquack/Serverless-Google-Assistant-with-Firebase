import {MetricResponse} from "../index";
import {expect} from "chai";
import "mocha";

// Firebase Mock Imports
const firebasemock = require("firebase-mock");
const firestore = new firebasemock.MockFirestore();
const mockfirestore = new firebasemock.MockFirestore();
let mockauth = new firebasemock.MockFirebase();


describe("Metric Response", () => {
    let metricResponse: MetricResponse;
    mockauth = new firebasemock.MockFirebase();
    const mocksdk = firebasemock.MockFirebaseSdk(null, function () {
        return mockauth;
    }, function () {
        return mockfirestore;
    });
    mocksdk.initializeApp();

    before(() => {
        metricResponse = new MetricResponse(firestore);
    });
    describe("Database Transcations", () => {
        it("it should equal a response dynamically generated from response and total count", async () => {
            firestore.autoFlush();
            metricResponse.reference.add({metric: "test", total_count: "30", response: "SOME DATA {total_count}"});
            expect(await metricResponse.getMetricResponse("test")).to.equal("SOME DATA 30")
        });
        it("it should equal the response if total_count is not defined", async () => {
          firestore.autoFlush();
          metricResponse.reference.add({metric: "test", response: "SOME DATA"});
          expect(await metricResponse.getMetricResponse("test")).to.equal("SOME DATA")
        });
    });

    describe("Response from Intent/Params", () => {
        it("Should return welcome if welcome intent", async () => {
            const intent: string = "Default Welcome Intent";
            expect(await metricResponse.getResponse(intent)).to.contain("Welcome");
        });
        it("Should return not recognized if unknown intent", async () => {
            const intent: string = "Not declared intent";
            expect(await metricResponse.getResponse(intent)).to.contain("not recognize");
        });
    });
});
