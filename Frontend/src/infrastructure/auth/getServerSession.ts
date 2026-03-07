import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { getSessionConfig } from '@/infrastructure/auth/session';

export async function getSession() {
    const session = await getIronSession<any>(await cookies(), getSessionConfig());
    return session;
}
