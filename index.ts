import {dialogflow, DialogflowConversation, Parameters} from "actions-on-google";
import {config, https} from "firebase-functions";
import {initializeApp, firestore} from "firebase-admin";
import {CollectionReference, QuerySnapshot, QueryDocumentSnapshot, DocumentData, Firestore} from "@google-cloud/firestore";

export class MetricResponse {
    db: Firestore;
    reference: CollectionReference;
    constructor(fs : Firestore) {
        this.db = fs;
        this.reference = this.db.collection(process.env.GOOGLE_FACTS_TABLENAME || "facts");
    }

    async getMetricResponse(metric : string): Promise<string> {
        // Initial Response
        let result = `I don't recognize the metric, ${metric}`;

        // Query metric from facts collection
        try {
            let results: QuerySnapshot = await this.reference.where("metric", "==", metric).get();
            results.forEach((doc : QueryDocumentSnapshot) => {
                const data: DocumentData = doc.data();
                if (data && data.response) {
                    result = doc.data().response;
                    if (data.total_count) {
                        result = result.replace(/{total_count}/gi, doc.data().total_count);
                    }
                } else {
                    result = `no result is available for ${metric}`;
                }
            });
        } catch (e) {
            console.log("ERROR", e);
        }
        return Promise.resolve(result);
    }

    async getResponse(intent : string, parameters? : Parameters): Promise<string> {
        let response = `I do not recognize ${intent}`;
        switch (intent) {
            case "Default Welcome Intent":
                response = "Welcome to facts!";
                break;
            default:
                if (parameters && parameters.metrics) {
                    const metric: string = String(parameters.metrics);
                    try {
                        response = await this.getMetricResponse(metric);
                    } catch (e) {
                        console.log("ERROR", e);
                        response = "an unknown error occured. Please try again";
                    }
                }
                break;
        }
        return Promise.resolve(response);
    }
}

const app = dialogflow({debug: true});
initializeApp(config().firebase);
app.fallback(async function (conv : DialogflowConversation) {
    const fs = firestore();
    try {
        conv.ask(await new MetricResponse(fs).getResponse(conv.intent, conv.parameters));
    } catch (e) {
        console.log("ERROR", e);
        conv.ask("an unknown error occured. Please try again");
    }
});
export const index = https.onRequest(app);
