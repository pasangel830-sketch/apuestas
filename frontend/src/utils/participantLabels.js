/**
 * @returns {{ address: string, nickname: string | null }[]}
 */
export function buildWhitelistEntries(participants, nicknames, nicknamesError) {
  if (!participants?.length) return [];
  const ok =
    !nicknamesError &&
    Array.isArray(nicknames) &&
    nicknames.length === participants.length;
  return participants.map((addr, i) => {
    const mote = ok ? nicknames[i] : null;
    const nickname = mote ? String(mote) : null;
    return { address: addr, nickname };
  });
}

/** @param {string} addr */
export function buildWhitelistDisplayLines(participants, nicknames, nicknamesError) {
  return buildWhitelistEntries(participants, nicknames, nicknamesError).map(({ address, nickname }) =>
    nickname ? `${nickname} (${address})` : address,
  );
}

/** @param {string} addr */
export function playerDisplayLabel(addr, nicknameByLower) {
  if (!addr) return '';
  const nick = nicknameByLower?.[addr.toLowerCase()];
  return nick ? `${nick} (${addr})` : `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}
