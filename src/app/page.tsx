import { ObjectId } from 'mongodb';
import { headers } from 'next/headers';
import { Nav } from '@/components/nav';
import { auth } from '@/lib/auth';
import { UserService } from '@/users/user.service';
import { HomeClient } from './page.client';

const fetchUserById = async (userId: ObjectId) => {
  const userService = new UserService();
  return await userService.getUser(userId);
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  const userId = new ObjectId(session.user.id);
  const appUser = await fetchUserById(userId);

  return (
    <div>
      <Nav />
      <HomeClient appUser={appUser} />
    </div>
  );
}
