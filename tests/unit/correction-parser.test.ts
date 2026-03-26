import { describe, expect, it } from 'vitest';

import {
  DEFAULT_CORRECTION_FEEDBACK,
  parseCorrectionResponse
} from '../../services/ai/src/correction';

describe('correction response parser', () => {
  it('parses corrected and feedback fields from a valid response', () => {
    expect(
      parseCorrectionResponse(
        '{"corrected":"I went to the station yesterday.","feedback":"과거 시제와 정관사를 보완하세요."}'
      )
    ).toEqual({
      corrected: 'I went to the station yesterday.',
      feedback: '과거 시제와 정관사를 보완하세요.'
    });
  });

  it('falls back to the default feedback when the explanation is missing', () => {
    expect(
      parseCorrectionResponse(
        '{"corrected":"I went to the station yesterday."}'
      )
    ).toEqual({
      corrected: 'I went to the station yesterday.',
      feedback: DEFAULT_CORRECTION_FEEDBACK
    });
  });
});
