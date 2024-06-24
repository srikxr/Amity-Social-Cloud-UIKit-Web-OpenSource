import React, { useRef } from 'react';
import Truncate from 'react-truncate-markup';
import { backgroundImage as CommunityImage } from '~/icons/Community';

import StoryRing from './StoryRing';
import useStories from '~/social/hooks/useStories';
import useSDK from '~/core/hooks/useSDK';
import { checkStoryPermission } from '~/utils';
import { useStoryContext } from '~/v4/social/providers/StoryProvider';
import { useCommunityInfo } from '~/social/components/CommunityInfo/hooks';
import { useNavigation } from '~/social/providers/NavigationProvider';

import {
  AddStoryButton,
  ErrorButton,
  HiddenInput,
  StoryAvatar,
  StoryTabContainer,
  StoryTitle,
  StoryWrapper,
} from './styles';
import { isAdmin, isModerator } from '~/helpers/permissions';
import { FormattedMessage } from 'react-intl';
import useUser from '~/core/hooks/useUser';

interface StoryTabCommunityFeedProps {
  communityId: string;
}

export const StoryTabCommunityFeed: React.FC<StoryTabCommunityFeedProps> = ({ communityId }) => {
  const { onClickStory } = useNavigation();
  const { stories } = useStories({
    targetId: communityId,
    targetType: 'community',
    options: { orderBy: 'asc', sortBy: 'createdAt' },
  });
  const { avatarFileUrl } = useCommunityInfo(communityId);
  const { setFile } = useStoryContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleOnClick = () => {
    if (Array.isArray(stories) && stories.length === 0) return;
    onClickStory(communityId, 'communityFeed');
  };

  const { currentUserId, client } = useSDK();
  const user = useUser(currentUserId);
  const isGlobalAdmin = isAdmin(user?.roles);
  const isCommunityModerator = isModerator(user?.roles);
  const hasStoryPermission =
    isGlobalAdmin || isCommunityModerator || checkStoryPermission(client, communityId);

  const hasStoryRing = stories?.length > 0;
  const hasUnSeen = stories.some((story) => !story?.isSeen);
  const uploading = stories.some((story) => story?.syncState === 'syncing');
  const isErrored = stories.some((story) => story?.syncState === 'error');

  return (
    <StoryTabContainer>
      <StoryWrapper>
        {hasStoryRing && (
          <StoryRing
            pageId="*"
            componentId="story_tab_component"
            hasUnseen={hasUnSeen}
            uploading={uploading}
            isErrored={isErrored}
            size={48}
          />
        )}
        <StoryAvatar
          onClick={handleOnClick}
          avatar={avatarFileUrl}
          backgroundImage={CommunityImage}
        />
        {hasStoryPermission && (
          <>
            <AddStoryButton onClick={handleAddIconClick} />
            <HiddenInput
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
          </>
        )}
        {isErrored && <ErrorButton />}
      </StoryWrapper>
      <Truncate lines={1}>
        <StoryTitle>
          <FormattedMessage id="storyTab.title" />
        </StoryTitle>
      </Truncate>
    </StoryTabContainer>
  );
};