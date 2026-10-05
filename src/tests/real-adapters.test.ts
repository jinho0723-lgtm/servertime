import { describe, it, expect } from 'vitest';
import { MelonTicketPublicAdapter } from '../lib/ingestion/adapters/melon-ticket-adapter';
import { Yes24PublicAdapter } from '../lib/ingestion/adapters/yes24-adapter';
import { TicketlinkPublicAdapter } from '../lib/ingestion/adapters/ticketlink-adapter';
import { InterparkPublicAdapter } from '../lib/ingestion/adapters/interpark-adapter';

describe('Real Live Ticket Adapters Execution', () => {
  it('MelonTicketPublicAdapter fetches and parses real events', async () => {
    const adapter = new MelonTicketPublicAdapter();
    const raw = await adapter.fetchEvents();
    console.log('[Melon Raw Count]:', raw.length);
    expect(raw.length).toBeGreaterThan(0);

    const normalized = await adapter.parseAndNormalize(raw);
    console.log('[Melon Normalized Count]:', normalized.length);
    expect(normalized.length).toBeGreaterThan(0);
    console.log('[Melon Sample 1]:', normalized[0]);
  }, 10000);

  it('Yes24PublicAdapter fetches and parses real events', async () => {
    const adapter = new Yes24PublicAdapter();
    const raw = await adapter.fetchEvents();
    console.log('[Yes24 Raw Count]:', raw.length);
    expect(raw.length).toBeGreaterThan(0);

    const normalized = await adapter.parseAndNormalize(raw);
    console.log('[Yes24 Normalized Count]:', normalized.length);
    expect(normalized.length).toBeGreaterThan(0);
    console.log('[Yes24 Sample 1]:', normalized[0]);
  }, 10000);

  it('TicketlinkPublicAdapter fetches and parses real events', async () => {
    const adapter = new TicketlinkPublicAdapter();
    const raw = await adapter.fetchEvents();
    console.log('[Ticketlink Raw Count]:', raw.length);
    expect(raw.length).toBeGreaterThan(0);

    const normalized = await adapter.parseAndNormalize(raw);
    console.log('[Ticketlink Normalized Count]:', normalized.length);
    expect(normalized.length).toBeGreaterThan(0);
    console.log('[Ticketlink Sample 1]:', normalized[0]);
  }, 10000);

  it('InterparkPublicAdapter handles WAF/404 with 0 fake events', async () => {
    const adapter = new InterparkPublicAdapter();
    const raw = await adapter.fetchEvents();
    console.log('[Interpark Raw Count]:', raw.length);
    expect(raw.length).toBe(0); // Honest 0 count

    const normalized = await adapter.parseAndNormalize(raw);
    expect(normalized.length).toBe(0);
  }, 10000);
});
