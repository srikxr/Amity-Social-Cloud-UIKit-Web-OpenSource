import React, { useEffect, useRef, useState } from 'react';

import Truncate from 'react-truncate-markup';
import {
  CustomRenderer,
  Tester,
} from '~/v4/social/internal-components/StoryViewer/Renderers/types';
import { SpeakerButton } from '~/v4/social/elements';

import { BottomSheet, Typography } from '~/v4/core/components';
import { Button } from '~/v4/core/natives/Button';

import { CommentTray } from '~/v4/social/components';
import { HyperLink } from '~/v4/social/elements/HyperLink';
import Header from '~/v4/social/internal-components/StoryViewer/Renderers/Wrappers/Header';
import Footer from '~/v4/social/internal-components/StoryViewer/Renderers/Wrappers/Footer';
import useCommunityMembersCollection from '~/v4/social/hooks/collections/useCommunityMembersCollection';
import useSDK from '~/v4/core/hooks/useSDK';
import { useUser } from '~/v4/core/hooks/objects/useUser';
import clsx from 'clsx';
import { LIKE_REACTION_KEY } from '~/v4/social/constants/reactions';
import { checkStoryPermission, formatTimeAgo, isAdmin, isModerator } from '~/v4/social/utils';
import rendererStyles from './Renderers.module.css';
import { StoryProgressBar } from '~/v4/social/elements/StoryProgressBar/StoryProgressBar';

export const renderer: CustomRenderer = ({
  story: {
    actions,
    addStoryButton,
    fileInputRef,
    currentIndex,
    storiesCount,
    increaseIndex,
    pageId,
    dragEventTarget,
    story,
  },
  action,
  config,
  messageHandler,
  onClose,
  onClickCommunity,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isOpenCommentSheet, setIsOpenCommentSheet] = useState(false);
  const { loader } = config;
  const { client } = useSDK();
  const { user } = useUser(client?.userId);

  const isLiked = !!(story && story.myReactions && story.myReactions.includes(LIKE_REACTION_KEY));
  const totalLikes = story?.reactions[LIKE_REACTION_KEY] || 0;

  const {
    storyId,
    syncState,
    reach,
    commentsCount,
    createdAt,
    creator,
    community,
    myReactions,
    data,
    items,
    isBottomSheetOpen,
    setIsBottomSheetOpen,
  } = story as Amity.Story;

  const { members } = useCommunityMembersCollection({
    queryParams: {
      communityId: community?.communityId as string,
    },
    shouldCall: !!community?.communityId,
  });
  const member = members?.find((member) => member.userId === client?.userId);
  const isMember = member != null;

  const heading = <div data-qa-anchor="community_display_name">{community?.displayName}</div>;
  const subheading =
    createdAt && creator?.displayName ? (
      <span>
        <span data-qa-anchor="created_at">{formatTimeAgo(createdAt as string)}</span> • By{' '}
        <span data-qa-anchor="creator_display_name">{creator?.displayName}</span>
      </span>
    ) : (
      ''
    );

  const isOfficial = community?.isOfficial || false;
  const isCreator = creator?.userId === user?.userId;
  const isGlobalAdmin = isAdmin(user?.roles);
  const isModeratorUser = isModerator(user?.roles);
  const haveStoryPermission =
    isGlobalAdmin || isModeratorUser || checkStoryPermission(client, community?.communityId);

  const vid = useRef<HTMLVideoElement>(null);

  const onWaiting = () => action('pause', true);
  const onPlaying = () => action('play', true);

  const videoLoaded = () => {
    messageHandler('UPDATE_VIDEO_DURATION', { duration: vid?.current?.duration });
    setLoaded(true);
    vid?.current
      ?.play()
      .then(() => {
        if (isPaused) {
          setIsPaused(false);
        }
        action('play');
      })
      .catch(() => {
        setMuted(true);
        vid?.current?.play().finally(() => {
          action('play');
        });
      });
  };

  const mute = () => setMuted(true);
  const unmute = () => setMuted(false);

  const play = () => {
    action('play', true);
    setIsPaused(false);
  };
  const pause = () => {
    action('pause', true);
    setIsPaused(true);
  };

  const openBottomSheet = () => {
    action('pause', true);
  };
  const closeBottomSheet = () => {
    action('play', true);
    setIsBottomSheetOpen(false);
  };
  const openCommentSheet = () => {
    action('pause', true);
    setIsOpenCommentSheet(true);
  };
  const closeCommentSheet = () => {
    action('play', true);
    setIsOpenCommentSheet(false);
  };

  const targetRootId = 'asc-uikit-stories-viewer';

  const handleOnClose = () => {
    onClose();
  };

  const handleProgressComplete = () => {
    if (currentIndex + 1 < storiesCount) {
      increaseIndex();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (vid.current) {
      if (isPaused || isBottomSheetOpen || isOpenCommentSheet) {
        vid.current.pause();
        action('pause', true);
      } else {
        vid.current.play().catch(() => {});
        action('play', true);
      }
    }
  }, [isPaused, isBottomSheetOpen, isOpenCommentSheet]);

  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.addEventListener('click', () => {
        action('pause', true);
        setIsPaused(true);
      });
      fileInputRef.current.addEventListener('cancel', () => {
        action('play', true);
        setIsPaused(false);
      });
    }
  }, []);

  useEffect(() => {
    if (dragEventTarget) {
      const handleDragStart = () => {
        action('pause', true);
        setIsPaused(true);
      };
      const handleDragEnd = () => {
        action('play', true);
        setIsPaused(false);
      };

      dragEventTarget.current?.addEventListener('dragstart', handleDragStart);
      dragEventTarget.current?.addEventListener('dragend', handleDragEnd);

      return () => {
        dragEventTarget.current?.removeEventListener('dragstart', handleDragStart);
        dragEventTarget.current?.removeEventListener('dragend', handleDragEnd);
      };
    }
  }, [dragEventTarget]);

  return (
    <div className={clsx(rendererStyles.rendererContainer)}>
      <StoryProgressBar
        pageId={pageId}
        duration={5000}
        currentIndex={currentIndex}
        storiesCount={storiesCount}
        isPaused={isPaused || isBottomSheetOpen || isOpenCommentSheet}
        onComplete={handleProgressComplete}
      />
      <SpeakerButton
        pageId="story_page"
        componentId="*"
        isMuted={muted}
        onPress={muted ? unmute : mute}
      />
      <Header
        community={community}
        heading={heading}
        subheading={subheading}
        isHaveActions={actions?.length > 0}
        haveStoryPermission={haveStoryPermission}
        isOfficial={isOfficial}
        isPaused={isPaused}
        onPlay={play}
        onPause={pause}
        onMute={mute}
        onUnmute={unmute}
        onAction={openBottomSheet}
        onClickCommunity={() => onClickCommunity?.()}
        onClose={handleOnClose}
        addStoryButton={addStoryButton}
      />
      <video
        data-qa-anchor="video_view"
        ref={vid}
        className={clsx(rendererStyles.storyVideo)}
        src={story?.videoData?.fileUrl || story?.videoData?.videoUrl?.original}
        controls={false}
        onLoadedData={videoLoaded}
        playsInline
        onWaiting={onWaiting}
        onPlaying={onPlaying}
        muted={muted}
        autoPlay
      />
      {!loaded && (
        <div className={clsx(rendererStyles.loadingOverlay)}>{loader || <div>loading...</div>}</div>
      )}

      <BottomSheet
        rootId={targetRootId}
        isOpen={isBottomSheetOpen}
        onClose={closeBottomSheet}
        mountPoint={document.getElementById(targetRootId) as HTMLElement}
        detent="content-height"
      >
        {actions?.map((bottomSheetAction) => (
          <Button
            className={clsx(rendererStyles.actionButton)}
            onPress={() => bottomSheetAction?.action()}
          >
            {bottomSheetAction?.icon && bottomSheetAction.icon}
            <Typography.BodyBold>{bottomSheetAction.name}</Typography.BodyBold>
          </Button>
        ))}
      </BottomSheet>
      <BottomSheet
        rootId={targetRootId}
        isOpen={isOpenCommentSheet}
        onClose={closeCommentSheet}
        mountPoint={document.getElementById(targetRootId) as HTMLElement}
        detent="full-height"
      >
        <CommentTray
          referenceId={storyId}
          referenceType={'story'}
          community={community as Amity.Community}
          shouldAllowCreation={community?.allowCommentInStory}
          shouldAllowInteraction={isMember}
        />
      </BottomSheet>
      {items?.[0]?.data?.url && (
        <div className={clsx(rendererStyles.hyperLinkContainer)}>
          <HyperLink
            href={
              items[0].data.url.startsWith('http')
                ? items[0].data.url
                : `https://${items[0].data.url}`
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => story?.analytics.markLinkAsClicked()}
          >
            <Truncate lines={1}>
              <span>
                {items[0]?.data?.customText || items[0].data.url.replace(/^https?:\/\//, '')}
              </span>
            </Truncate>
          </HyperLink>
        </div>
      )}
      <Footer
        pageId={pageId}
        storyId={storyId}
        syncState={syncState}
        reach={reach}
        commentsCount={commentsCount}
        reactionsCount={totalLikes}
        isLiked={isLiked}
        onClickComment={openCommentSheet}
        myReactions={myReactions}
        // Only story-creator and moderator of the community should be able to see impression count.
        showImpression={isCreator || checkStoryPermission(client, community?.communityId)}
        isMember={isMember}
      />
    </div>
  );
};

export const tester: Tester = (story) => {
  return {
    condition: !!story.story?.storyId && story.type === 'video',
    priority: 2,
  };
};

export default {
  renderer,
  tester,
};
