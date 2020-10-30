import React from 'react';
import { HashRouter as Router, Switch, Route, useHistory, useRouteMatch } from 'react-router-dom';

import useOneUser from '~/mock/useOneUser';
import ProfileSettings from '~/social/components/ProfileSettings';
import UserInfo from '.';

export default {
  title: 'SDK Connected/Social/User/Profile',
  parameters: { layout: 'centered' },
};

const SdkUserInfo = () => {
  const user = useOneUser();
  if (!user) {
    return <p>Loading...</p>;
  }

  const history = useHistory();
  const { params = {} } = useRouteMatch('/profile/:userId') || {};
  const { userId } = params;

  const editProfile = id => history.push(`/profile/${id}/edit`);

  return (
    <Switch>
      <Route path="/" exact>
        <UserInfo userId={user.userId} currentUserId={user.userId} editProfile={editProfile} />
      </Route>
      <Route path="/profile/:userId/edit">
        <ProfileSettings userId={userId} />
      </Route>
    </Switch>
  );
};

export const SdkUserInfoApp = () => {
  return (
    <Router>
      <SdkUserInfo />
    </Router>
  );
};

SdkUserInfoApp.storyName = 'My User Info';

export const AnotherUserInfo = () => {
  const [user, loading] = useOneUser();
  if (!loading) return <p>Loading...</p>;
  return <UserInfo userId={user.userId} />;
};

AnotherUserInfo.storyName = 'Another User Info';