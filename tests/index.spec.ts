
import { MetricResponse } from '../index';
import { expect } from 'chai';
import 'mocha';

describe('Response from Intent/Params', () => {
  it('Should return welcome if welcome intent', async () => {
    const intent: string = 'Default Welcome Intent';
    expect(await new MetricResponse().getResponse(intent)).to.contain('Welcome');
  });
  it('Should return not recognized if unknown intent', async () => {
    const intent: string = 'Not declared intent';
    expect(await new MetricResponse().getResponse(intent)).to.contain('not recognize');
  });
});