# Serverless Google Assistant with Firebase
--------
[![Build Status](https://travis-ci.org/danquack/Serverless-Google-Assistant-with-Firebase.svg?branch=master)](https://travis-ci.org/danquack/Serverless-Google-Assistant-with-Firebase)

This sample google assistant dialogflow is a facts-based action designed to report metrics out of firebase. The idea is that something external would update firebase, which would then be read through google assistant.

## Design
![action-design](https://www.lucidchart.com/publicSegments/view/55a1678d-11a8-40d4-a61b-ab56c0af47b8/image.png)

## Prereqs
1. <a href="https://nodejs.org/en/download/">Install NodeJS</a>
2. A <a href="https://developers.google.com/authorized-buyers/rtb/open-bidder/google-app-guide#create-a-google-cloud-platform-project">Google Project</a> is created
    - the project should have enabled firebase, cloud functions Deployment Manager V2 API
    - a service account should be created. For production, the role should be restricted but for now Owner will work.
    - the credentials JSON should be placed in root of the project, as serverless will need it

## Devtime dependencies
1. A firebase collection must be created for facts.
    - The collection should contain a field of "metric"
        i. The field should be lowercase space separated words
    - The collection should have a "total_count" and "response" attributes
2. The following environment variables should be baked into your system
    - `GOOGLE_APPLICATION_CREDENTIALS` - path to credentials file
    - `PROJECT_ID` - available in admin console


## Install instructions
1. Clone the repository
2. Run `npm install`
3. Start building your action in the <a href= "https://developers.google.com/actions/">google actions console</a>
4. Click ‘Add Action’ and build a custom intent. This will open dialogflow.
5. Create an intent called metrics. In the Action and parameters menu, set parameter name, entity, and value to `metrics, @metrics, $metrics` exclusively. Also enable all options under Fulfillment.
6. Update entities.yml with the entities and synonyms for your metric (Note: metric names correlate 1:1 back to firebase metrics)
7. Run `npm run-script update-entities` to deploy your entities
8. run `sls deploy` or `npm run-script deploy` to index to google cloud.
9. In dialogflow, go to Fulfillment on the left side, enable web hook, and place the URL given by serverless as the fulfillment address.   https://us-central1-<Project_ID>.cloudfunctions.net/index
10. Go to integrations and add your intent to the implicit invocation. Then click `See how it works in Google Assistant.` to try your new skill out. If you notice your entities are not catching on, you may need to train the assistant back under intents.

## Sample Entities/Sayings
Once you start adding entities, add them below.
