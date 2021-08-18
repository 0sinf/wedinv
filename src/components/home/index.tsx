import { Copy, EmojiLookLeft, EmojiLookRight, PinAlt } from "iconoir-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import styled, { css } from "styled-components";
import useSWR from "swr";

import Modal from "@/components/common/Modal";
import timeDiffFormat from "@/common/utils/timeDiffFormat";
import useStorage from "@/common/hooks/useStorage";
import coverPic from "@/public/photos/cover_min.jpg";
import mapPic from "@/public/photos/map.gif";
import { GetTalkListResponse, Party, Talk } from "@/talk/types";
import {
  BoxShadowStyle,
  BubbleHeadStyle,
  Main,
  SectionHeader,
  SectionHr,
  TextSansStyle,
} from "./styles";
import WriteTalk from "./talk/WriteTalk";

const Header = styled.h1`
  display: inline-block;
  margin: 40px 0;

  font-size: 20px;
  font-weight: 500;
  line-height: 2.5;

  hr {
    width: 70%;
    margin: 0 auto;
    border: 0;
    border-top: 1px solid #ccc;
  }
`;

const CoverPicWrap = styled.div`
  width: 90%;
  margin: 0 auto;
  margin-bottom: 40px;
  border-radius: 30px;
  overflow: hidden;
  line-height: 0;
`;

const GreetingP = styled.p`
  margin: 30px 0;
`;

const CallWrap = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 40px 0;
  > * {
    margin: 0 15px;
  }
`;

const CallButtonWrap = styled.div<{ bgColor: string }>`
  ${TextSansStyle}
  font-size: 13px;

  svg {
    display: block;
    margin: 0 auto;
    margin-bottom: 4px;
    width: 30px;
    height: 30px;
    color: white;
    padding: 15px;
    border-radius: 30px;
    background-color: ${({ bgColor }) => bgColor};
  }
`;

type CallButtonProps = {
  icon: React.ReactNode;
  bgColor: string;
  label: string;
};

const CallButton = ({ icon, bgColor, label }: CallButtonProps) => (
  <>
    <CallButtonWrap bgColor={bgColor}>
      {icon}
      {label}
    </CallButtonWrap>
  </>
);

const WeddingPhotoGallery = styled.ul`
  display: flex;
  flex-wrap: wrap;
  padding: 0 10px;

  li {
    height: 200px;
    flex-grow: 1;
    margin: 4px;
  }

  img {
    max-height: 100%;
    min-width: 100%;
    object-fit: cover;
    vertical-align: bottom;
  }
`;

const SliderWrap = styled.div`
  .slick-track {
    display: flex;
  }
  .slick-track .slick-slide {
    display: flex;
    height: auto;
    align-items: center;
    justify-content: center;
    div {
      outline: none;
    }
    img {
      width: 100%;
    }
  }
`;

const MapButton = styled.a`
  ${TextSansStyle}
  display: inline-block;
  padding: 8px 16px 8px 10px;
  border: 0;
  border-radius: 18px;
  margin: 0 10px;
  color: #666;
  font-size: 13px;
  text-decoration: none;
  background: #f3f3f3;
  line-height: 1.3;
  > svg {
    display: inline-block;
    width: 18px;
    height: 18px;
    margin: -4px 0;
    margin-right: 4px;
  }
`;

const GiveWrap = styled.div`
  display: inline-block;
  text-align: left;
  line-height: 2;
`;

const CopyTextButton = styled.button`
  padding: 0;
  border: none;
  background: none;

  svg {
    width: 18px;
    height: 18px;
    padding: 0 4px;
    color: #999;
    vertical-align: text-bottom;
  }
`;
const CopyText = ({ text }: { text: string }) => {
  const handleCopyText = () => navigator.clipboard.writeText(text);
  return (
    <>
      {text}
      <CopyTextButton onClick={handleCopyText} aria-label="복사">
        <Copy />
      </CopyTextButton>
    </>
  );
};

const WriteSectionSubHeader = styled.div`
  padding: 0 20px;
  margin-top: -68px;
  color: #666;
  p:first-child {
    float: left;
  }
  p:last-child {
    float: right;
  }
`;

const WriteButton = styled.button<{ visible: boolean }>`
  ${TextSansStyle}
  ${({ visible }) =>
    visible
      ? css`
          bottom: 45px;
        `
      : css`
          bottom: -100px;
        `}

  position: fixed;
  left: 50%;
  transform: translateX(-50%);

  width: calc(100% - 40px);
  max-width: calc(400px - 40px);
  padding: 16px;
  border: 0;
  border-radius: 8px;

  color: white;
  font-size: 16px;
  font-weight: bold;
  background: rgba(255, 136, 170, 0.9);

  ${BoxShadowStyle}

  transition: bottom 0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6);
`;

const TalkWrap = styled.div`
  position: relative;
  padding: 0 20px;
  margin: 20px 0;
`;

const WriteButtonTrigger = styled.div`
  position: absolute;
  top: 100px;
`;

const TalkBubbleWrap = styled.div<{ party: Party; color: string }>`
  ${TextSansStyle}
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  svg {
    ${({ party, color }) => BubbleHeadStyle(party, color)}
  }
  > div {
    ${({ party }) =>
      party === "BRIDE"
        ? css`
            margin-right: 44px;
            text-align: right;
          `
        : css`
            margin-left: 44px;
            text-align: left;
          `}
    line-height: 1.3;
    div.hi {
      display: flex;
      ${({ party }) =>
        party === "BRIDE"
          ? css`
              flex-direction: row-reverse;
            `
          : css`
              flex-direction: row;
            `}

      p {
        white-space: pre-wrap;
        text-align: left;
        word-break: break-all;
        overflow-wrap: break-word;
        display: inline-block;
        padding: 8px 12px;
        margin: 4px 0 0 0;
        ${({ party }) =>
          party === "BRIDE"
            ? css`
                border-radius: 20px 4px 20px 20px;
                margin-left: 3px;
              `
            : css`
                border-radius: 4px 20px 20px 20px;
                margin-right: 3px;
              `}
        background: #eee;
      }
      small {
        align-self: flex-end;
        flex-shrink: 0;
        color: #999;
        font-size: 11px;
      }
    }
  }
`;

type TalkBubbleProps = { talk: Talk };
const TalkBubble = ({ talk }: TalkBubbleProps) => {
  return (
    <TalkBubbleWrap party={talk.party} color={talk.color}>
      {talk.party === "BRIDE" ? <EmojiLookLeft /> : <EmojiLookRight />}
      <div>
        {talk.author}
        <div className="hi">
          <p>{talk.msg}</p>
          <small>
            {!talk.published && (
              <>
                심사중
                <br />
              </>
            )}
            {timeDiffFormat(new Date(talk.created))}
          </small>
        </div>
      </div>
    </TalkBubbleWrap>
  );
};

const ThankYou = styled.div`
  padding: 60px;
  color: #666;
`;

const Home = () => {
  const [writeTalkId, setWriteTalkId] = useStorage("talk.write.id");
  const { data, error } = useSWR<GetTalkListResponse>(
    `/api/talk/list?myId=${writeTalkId || ""}`
  );

  const [isGalleryModalShown, setGalleryModalShown] = useState(false);
  const [isWriteModalShown, setWriteModalShown] = useState(false);
  const [isWriteButtonShown, setWriteButtonShown] = useState(false);
  const [lastClickedGalleryItem, setLastClickedGalleryItem] =
    useState<number>();

  const sliderRef = useRef<Slider>(null);
  const writeButtonTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!writeButtonTriggerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setWriteButtonShown(entry.isIntersecting);
    });
    observer.observe(writeButtonTriggerRef.current);

    return () => observer.disconnect();
  }, [writeButtonTriggerRef]);

  const handlePhotoClick = (i: number) => {
    setLastClickedGalleryItem(i);
    setGalleryModalShown(true);
  };

  const handleGalleryModalClose = () => setGalleryModalShown(false);

  const handleWriteButtonClick = () => setWriteModalShown(true);

  const handleWriteModalClose = () => setWriteModalShown(false);

  const handleWrite = (id: string) => {
    setWriteTalkId(id);
    setWriteModalShown(false);
  };

  return (
    <Main>
      <Header>
        박영훈
        <hr />
        김현주
      </Header>
      <CoverPicWrap>
        <Image src={coverPic} priority={true} placeholder="blur" alt="" />
      </CoverPicWrap>
      <p>
        2021년 10월 3일 일요일 오후 1시
        <br />
        반포 JW 메리어트 호텔 5층 그랜드볼룸
      </p>
      <SectionHr />

      <SectionHeader>결혼합니다.</SectionHeader>
      <GreetingP>
        청명한 가을날
        <br />
        새로이 시작하는 작은 사랑이
        <br />
        보다 크고 깊은 사랑이 되려고 합니다.
        <br />
        함께 자리하시어 축복해 주시면
        <br />
        더없는 기쁨이겠습니다.
      </GreetingP>
      <GreetingP>
        김종오 · 강경자의 장녀 현주
        <br />
        박민양 · 최승현의 차남 영훈
      </GreetingP>
      <CallWrap>
        <a href="tel:01071056849">
          <CallButton
            icon={<EmojiLookRight />}
            bgColor="#abdaab"
            label="신랑측에 연락하기"
          />
        </a>
        <a href="tel:01073692869">
          <CallButton
            icon={<EmojiLookLeft />}
            bgColor="#c2e0a3"
            label="신부측에 연락하기"
          />
        </a>
      </CallWrap>
      <SectionHr />
      <WeddingPhotoGallery>
        {Array.from(Array(14), (_, i) => i).map((i) => (
          <li key={i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              role="button"
              src={`/photos/p${i + 1}.jpeg`}
              onClick={() => handlePhotoClick(i)}
              loading="lazy"
              alt=""
            />
          </li>
        ))}
      </WeddingPhotoGallery>
      {isGalleryModalShown && (
        <Modal handleClose={handleGalleryModalClose}>
          <SliderWrap onClick={handleGalleryModalClose}>
            <Slider
              initialSlide={lastClickedGalleryItem}
              slidesToShow={1}
              slidesToScroll={1}
              arrows={false}
              dots={false}
              ref={sliderRef}
            >
              {Array.from(Array(14), (_, i) => i + 1).map((i) => (
                <div key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/photos/p${i}.jpeg`} alt="" />
                </div>
              ))}
            </Slider>
          </SliderWrap>
        </Modal>
      )}
      <SectionHr />
      <SectionHeader>오시는 길</SectionHeader>
      <Image src={mapPic} width="400px" alt="" />
      <p>
        서울 서초구 신반포로 176
        <br />
        반포 JW 메리어트 호텔 5층 그랜드볼룸
      </p>
      <MapButton href="https://place.map.kakao.com/8005133">
        <PinAlt color="#1199EE" /> 카카오맵
      </MapButton>
      <MapButton href="https://map.naver.com/v5/entry/place/11583195">
        <PinAlt color="#66BB66" /> 네이버지도
      </MapButton>
      <SectionHr />
      <SectionHeader>💸 마음 전하실 곳</SectionHeader>
      <GiveWrap>
        <p>
          <strong>신랑측</strong> (박영훈)
          <br />
          <CopyText text="국민은행 867701-04-035141" />
        </p>
        <p>
          <strong>신부측</strong> (김현주)
          <br />
          <CopyText text="우리은행 1002-291-920831" />
        </p>
      </GiveWrap>
      <SectionHr />
      <SectionHeader>축하의 한마디</SectionHeader>
      <WriteSectionSubHeader>
        <p>신랑측</p>
        <p>신부측</p>
      </WriteSectionSubHeader>
      <div style={{ clear: "both" }} />
      <TalkWrap>
        <WriteButtonTrigger ref={writeButtonTriggerRef} />
        {data?.talks.map((talk, idx) => (
          <TalkBubble key={idx} talk={talk} />
        ))}
      </TalkWrap>
      <ThankYou>{writeTalkId ? "감사합니다." : ""}</ThankYou>
      {!writeTalkId && (
        <WriteButton
          visible={isWriteButtonShown}
          onClick={handleWriteButtonClick}
        >
          😍 나도 한마디
        </WriteButton>
      )}
      {isWriteModalShown && (
        <Modal handleClose={handleWriteModalClose}>
          <WriteTalk onWrite={handleWrite} />
        </Modal>
      )}
    </Main>
  );
};

export default Home;
