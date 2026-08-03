import "./index.css";
import { Composition } from "remotion";
import { DevisFlowDemo } from "./Composition";
import { Reel01Hook, Reel02AvantApres, Story01Temoignage, Story02Urgence, Carousel6Raisons } from "./Instagram";
import {
  Story03SophieElec,
  Story04JeanPierre,
  Reel03Demo30sec,
  Reel04Reglementation,
  Reel05Temoignage,
  Reel06Coulisses,
  CarouselTemoignages,
  ReelComparateur,
  StoryHighlightCover,
} from "./Instagram2";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="DevisFlowDemo" component={DevisFlowDemo} durationInFrames={1800} fps={30} width={1280} height={720} />
      <Composition id="InstagramReel01" component={Reel01Hook} durationInFrames={450} fps={30} width={1080} height={1920} />
      <Composition id="InstagramReel02" component={Reel02AvantApres} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="InstagramStory01" component={Story01Temoignage} durationInFrames={225} fps={30} width={1080} height={1920} />
      <Composition id="InstagramStory02" component={Story02Urgence} durationInFrames={225} fps={30} width={1080} height={1920} />
      <Composition id="InstagramCarousel" component={Carousel6Raisons} durationInFrames={900} fps={30} width={1080} height={608} />
      <Composition id="InstagramStory03" component={Story03SophieElec} durationInFrames={225} fps={30} width={1080} height={1920} />
      <Composition id="InstagramStory04" component={Story04JeanPierre} durationInFrames={225} fps={30} width={1080} height={1920} />
      <Composition id="InstagramReel03" component={Reel03Demo30sec} durationInFrames={540} fps={30} width={1080} height={1920} />
      <Composition id="InstagramReel04" component={Reel04Reglementation} durationInFrames={450} fps={30} width={1080} height={1920} />
      <Composition id="InstagramReel05" component={Reel05Temoignage} durationInFrames={480} fps={30} width={1080} height={1920} />
      <Composition id="InstagramReel06" component={Reel06Coulisses} durationInFrames={450} fps={30} width={1080} height={1920} />
      <Composition id="InstagramCarouselTemoignages" component={CarouselTemoignages} durationInFrames={750} fps={30} width={1080} height={608} />
      <Composition id="InstagramReelComparateur" component={ReelComparateur} durationInFrames={360} fps={30} width={1080} height={1920} />
      <Composition id="InstagramHighlightCover" component={StoryHighlightCover} durationInFrames={540} fps={30} width={1080} height={1080} />
    </>
  );
};
