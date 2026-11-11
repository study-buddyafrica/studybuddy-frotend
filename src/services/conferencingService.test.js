import { adaptSessionPayload } from './conferencingService';

describe('conferencingService adaptSessionPayload contract', () => {
  it('correctly adapts backend payload with tenant-scoped room and JaaS fields', () => {
    const rawPayload = {
      data: {
        id: 'sess-123',
        live_session_id: 'sess-123',
        domain: '8x8.vc',
        room_name: 'vpaas-magic-cookie-tenant/room-xyz',
        jaas_room_name: 'vpaas-magic-cookie-tenant/room-xyz',
        token: 'header.payload.signature',
        whiteboard_link: 'https://excalidraw.com/#room=123',
        student_meeting_link: 'https://8x8.vc/vpaas-magic-cookie-tenant/room-xyz',
        teacher_meeting_link: 'https://8x8.vc/vpaas-magic-cookie-tenant/room-xyz',
        is_owner: false,
        duration_minutes: 60,
      },
    };

    const adapted = adaptSessionPayload(rawPayload);

    expect(adapted.live_session_id).toBe('sess-123');
    expect(adapted.domain).toBe('8x8.vc');
    expect(adapted.room_name).toBe('vpaas-magic-cookie-tenant/room-xyz');
    expect(adapted.jaas_room_name).toBe('vpaas-magic-cookie-tenant/room-xyz');
    expect(adapted.token).toBe('header.payload.signature');
    expect(adapted.whiteboard_link).toBe('https://excalidraw.com/#room=123');
    expect(adapted.student_meeting_link).toBe('https://8x8.vc/vpaas-magic-cookie-tenant/room-xyz');
    expect(adapted.room_url).toBe('https://8x8.vc/vpaas-magic-cookie-tenant/room-xyz');
    expect(adapted.private_key).toBeUndefined();
  });

  it('falls back to 8x8.vc when domain is absent', () => {
    const rawPayload = {
      room_name: 'vpaas-magic-cookie-tenant/bare-room',
      token: 'jwt-token-abc',
    };

    const adapted = adaptSessionPayload(rawPayload);

    expect(adapted.domain).toBe('8x8.vc');
    expect(adapted.room_name).toBe('vpaas-magic-cookie-tenant/bare-room');
    expect(adapted.token).toBe('jwt-token-abc');
  });
});
