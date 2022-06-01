import * as mockfs from 'mock-fs';
import { IntegrationTests } from '../../lib/runner/integration-tests';

describe('IntegrationTests', () => {
  const tests = new IntegrationTests('test');
  let stderrMock: jest.SpyInstance;
  stderrMock = jest.spyOn(process.stderr, 'write').mockImplementation(() => { return true; });
  beforeEach(() => {
    mockfs({
      'test/test-data': {
        'integ.integ-test1.js': 'content',
        'integ.integ-test2.js': 'content',
        'integ.integ-test3.js': 'content',
      },
    });
  });

  afterEach(() => {
    mockfs.restore();
  });

  test('from cli args', async () => {
    const integTests = await tests.fromCliArgs(['test-data/integ.integ-test1.js']);

    expect(integTests.length).toEqual(1);
    expect(integTests[0].fileName).toEqual(expect.stringMatching(/integ.integ-test1.js$/));
  });

  test('from cli args, test not found', async () => {
    const integTests = await tests.fromCliArgs(['test-data/integ.integ-test16.js']);

    expect(integTests.length).toEqual(0);
    expect(stderrMock.mock.calls[0][0]).toContain(
      'No such integ test: test-data/integ.integ-test16.js',
    );
    expect(stderrMock.mock.calls[1][0]).toContain(
      'Available tests: test-data/integ.integ-test1.js test-data/integ.integ-test2.js test-data/integ.integ-test3.js',
    );
  });

  test('from cli args, exclude', async () => {
    const integTests = await tests.fromCliArgs(['test-data/integ.integ-test1.js'], true);

    const fileNames = integTests.map(test => test.fileName);
    expect(integTests.length).toEqual(2);
    expect(fileNames).not.toContain(
      'test/test-data/integ.integ-test1.js',
    );
  });
});
