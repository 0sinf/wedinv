// import { EmojiLookLeft, EmojiLookRight, PinAlt } from "iconoir-react"

import {
  CalendarDaysIcon,
  DocumentDuplicateIcon,
  FaceSmileIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import styled, { css } from "styled-components";
import useSWR from "swr";

import Modal from "@/components/common/Modal";
import timeDiffFormat from "@/common/utils/timeDiffFormat";
import { useSessionStorage } from "@/common/hooks/useStorage";
import coverPic from "@/public/photos/cover.jpg";
import mapPic from "@/public/photos/map.png";
import gravityLogo from "@/public/grp_og.png";
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
import EditTalk from "./talk/EditTalk";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";
import * as ics from "ics";

const GROOM = "김철원";
const BRIDE = "임지원";

const Header = styled.h1`
  display: inline-block;
  margin: 40px 0;

  font-size: 20px;
  font-weight: 900;
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
    width: 60px;
    height: 60px;
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

const PhotoGrid = styled.ul`
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

const SliderWrap = styled.div<{ isZoomed: boolean }>`
  height: 100%;
  ${({ isZoomed }) =>
    isZoomed &&
    css`
      * {
        overflow: visible !important;
      }
    `}
  .slick-track {
    display: flex;
  }
  .slick-track .slick-slide {
    display: flex;

    ${({ isZoomed }) =>
      isZoomed &&
      css`
        &:not(.slick-active) {
          visibility: hidden;
        }
      `}

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

type PinchPhotoProps = { src: string; onZoom: (isZoomed: boolean) => void };
const PinchPhoto = ({ src, onZoom }: PinchPhotoProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const pz = useRef<QuickPinchZoom>(null);
  const handleUpdate = useCallback(
    ({ x, y, scale }) => {
      if (!imgRef.current) return;
      const value = make3dTransformValue({ x, y, scale });
      imgRef.current.style.setProperty("transform", value);
      onZoom(scale > 1);
    },
    [onZoom]
  );

  return (
    <QuickPinchZoom ref={pz} onUpdate={handleUpdate} draggableUnZoomed={false}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} src={src} alt="" style={{ cursor: "pointer" }} />
    </QuickPinchZoom>
  );
};

type PhotoGalleryProps = {
  src: number[];
  initialSlide?: number;
  onClose: () => void;
};
const PhotoGallery = ({ src, initialSlide, onClose }: PhotoGalleryProps) => {
  const [isZoomed, setZoomed] = useState(false);
  const index = src.indexOf(initialSlide || 0);

  return (
    <SliderWrap isZoomed={isZoomed} onClick={onClose}>
      <Slider
        initialSlide={index}
        slidesToShow={1}
        slidesToScroll={1}
        arrows={false}
        dots={false}
      >
        {src.map((i) => (
          <div key={i}>
            <PinchPhoto onZoom={setZoomed} src={`/photos/g${i}.jpg`} />
          </div>
        ))}
      </Slider>
    </SliderWrap>
  );
};

const CalendarButton = styled.div`
  ${TextSansStyle}
  display: inline-block;
  padding: 10px;
  border: 0;
  border-radius: 18px;
  margin: 0 10px;
  color: #ffffff;
  font-size: 13px;
  text-decoration: none;
  background: #be3455;
  cursor: pointer;
  line-height: 0;
  > svg {
    display: inline-block;
    width: 18px;
    height: 18px;
    margin: 0;
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
    width: 20px;
    height: 20px;
    padding: 2px;
    color: #999;
    vertical-align: sub;
  }
`;
const CopyText = ({
  text,
  placeholder = "계좌번호가 복사 되었습니다.",
}: {
  text: string;
  placeholder?: string;
}) => {
  const handleCopyText = () => {
    const fallbackCopyClipboard = (value: string) => {
      const $text = document.createElement("textarea");
      document.body.appendChild($text);
      $text.value = value;
      $text.select();
      document.execCommand("copy");
      document.body.removeChild($text);
    };

    navigator.clipboard
      .writeText(text)
      .catch(() => fallbackCopyClipboard(text))
      .then(() => alert(placeholder));
  };
  return (
    <>
      {text}
      <CopyTextButton onClick={handleCopyText} aria-label="복사">
        <DocumentDuplicateIcon />
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
  font-weight: 900;
  background: rgba(190, 52, 85, 0.9);

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
  height: 100%;
`;

const TalkBubbleWrap = styled.div<{
  party: Party;
  color: string;
  selected: boolean;
}>`
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
    div.bubble-info-wrap {
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
        ${({ selected }) =>
          selected &&
          css`
            background: #ddd;
          `}
      }
      small {
        align-self: flex-end;
        flex-shrink: 0;
        color: #999;
        font-size: 11px;
      }
    }
    .edit {
      font-size: 0.9em;
      color: #999;
      text-decoration: underline;
    }
  }
`;

type TalkBubbleProps = {
  talk: Talk;
  selected: boolean;
  onBubbleClick: (id: string | undefined) => void;
  onEditClick: (id: string) => void;
};
const TalkBubble = ({
  talk,
  selected,
  onBubbleClick,
  onEditClick,
}: TalkBubbleProps) => {
  const handleBubbleClick: MouseEventHandler = (e) => {
    e.stopPropagation();
    onBubbleClick(talk.id);
  };
  const handleBubbleOutsideClick: MouseEventHandler = (e) =>
    onBubbleClick(undefined);
  const handleEditClick: MouseEventHandler = (e) => {
    e.stopPropagation();
    onEditClick(talk.id);
  };
  const editBtn = (
    <span className="edit" onClick={handleEditClick}>
      수정하기
    </span>
  );
  return (
    <TalkBubbleWrap party={talk.party} color={talk.color} selected={selected}>
      {talk.party === "BRIDE" ? <FaceSmileIcon /> : <FaceSmileIcon />}
      <div onClick={handleBubbleOutsideClick}>
        {selected && talk.party === "BRIDE" && <>{editBtn} </>}
        {talk.author}
        {selected && talk.party === "GROOM" && <> {editBtn}</>}
        <div className="bubble-info-wrap">
          <p onClick={handleBubbleClick}>{talk.msg}</p>

          <small>
            {!talk.published
              ? "검수중"
              : timeDiffFormat(new Date(talk.created))}
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

const Home = ({
  photo = [],
  explict = false,
  hideBus = false,
}: {
  photo: number[];
  explict: boolean;
  hideBus: boolean;
}) => {
  const [writeDone, setWriteDone] = useSessionStorage("talk.writedone");
  const {
    data: talkListResp,
    error,
    mutate,
  } = useSWR<GetTalkListResponse>("/api/talk/list");

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showWriteTalkModal, setShowWriteTalkModal] = useState(false);
  const [showEditTalkModal, setShowEditTalkModal] = useState<Talk>();
  const [isWriteButtonShown, setWriteButtonShown] = useState(false);
  const [lastClickedGalleryItem, setLastClickedGalleryItem] =
    useState<number>();
  const [selectedTalkId, setSelectedTalkId] = useState<string>();

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
    setShowGalleryModal(true);
  };

  const handleGalleryModalClose = () => setShowGalleryModal(false);

  const handleTalkBubbleClick = (id: string | undefined) =>
    setSelectedTalkId(id);

  const handleWriteButtonClick = () => setShowWriteTalkModal(true);
  const handleWriteTalk = (_: string) => {
    setWriteDone("done");
    setShowWriteTalkModal(false);
    mutate();
  };
  const handleWriteTalkModalClose = () => setShowWriteTalkModal(false);

  const handleTalkEditClick = (id: string) => {
    const talk = talkListResp?.talks?.find((t) => t.id === id);
    if (!talk) return;
    setShowEditTalkModal(talk);
    setSelectedTalkId(undefined);
  };
  const handleEditTalk = (_: string) => {
    setWriteDone("done");
    setShowEditTalkModal(undefined);
    mutate();
  };
  const handleEditTalkModalClose = () => setShowEditTalkModal(undefined);

  const handleOnClickAddEvent = async () => {
    const event = {
      start: [2023, 12, 17, 12, 0],
      duration: { hours: 2, minutes: 0 },
      title: "김철원/임지원 결혼식",
      description: "김철원/임지원 결혼합니다",
      location:
        "그래비티 서울 판교 오토그래프컬렉션 대한민국 경기도 성남시 분당구 판교역로146번길 2, 13529",
      url: "https://jiwon.chulwon.kim/",
      geo: { lat: 37.393427, lon: 127.1101018 },
      categories: ["wedding"],
      status: "CONFIRMED",
      busyStatus: "BUSY",
      organizer: { name: "김철원", email: "riky@myriky.net" },
      attendees: [
        {
          name: "임지원",
          email: "lim121229@gmail.com",
          rsvp: true,
          partstat: "ACCEPTED",
          role: "REQ-PARTICIPANT",
        },
      ],
    };

    const filename = "wedding_invite.ics";
    const file = await new Promise((resolve, reject) => {
      // @ts-ignore
      ics.createEvent(event, (error, value) => {
        if (error) {
          reject(error);
        }

        resolve(new File([value], filename, { type: "text/calendar" }));
      });
    });
    // @ts-ignore
    const url = URL.createObjectURL(file);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  };

  return (
    <Main>
      <Header>
        {GROOM}
        <hr />
        {BRIDE}
      </Header>
      <CoverPicWrap>
        <Image src={coverPic} priority={true} placeholder="blur" alt="" />
      </CoverPicWrap>
      <p style={{ wordBreak: "keep-all", padding: "0 3em" }}>
        2023년 12월 17일 일요일 낮 12시
        <br />
        그래비티 서울 판교 오토그래프 컬렉션 호텔, 지하1층 스페이스볼룸
      </p>

      <SectionHr />

      <SectionHeader>
        결혼합니다.
        <br />
      </SectionHeader>
      <GreetingP>
        같이 밥 먹을 때 더 맛있고
        <br />
        같이 놀 때 더 재미있고
        <br />
        같이 견디면 그 어떤 어려움도 쉽게 느껴지는 그런 사람과
        <br />
        한 곳을 바라보며 함께 걸어가고자 합니다
        <br />
        모두 오셔서 저희 시작의 순간을 축하해 주세요.
        <br />
      </GreetingP>
      <GreetingP>
        김영해 · 정선주의 차남 철원
        <br />
        임봉규 · 고제성의 장녀 지원
      </GreetingP>
      <CallWrap>
        {explict ? (
          <>
            <a
              href="http://qr.kakao.com/talk/r3k9j93gfEt4Ql1H962fyXa.ajM-"
              target="_blank"
              rel="noreferrer"
            >
              <CallButton
                icon={<FaceSmileIcon />}
                bgColor="#abdaab"
                label="신랑에게 카톡하기"
              />
            </a>
            <a
              href="http://qr.kakao.com/talk/_kU.AR00es41ms7A3ociERlRiPw-"
              target="_blank"
              rel="noreferrer"
            >
              <CallButton
                icon={<FaceSmileIcon />}
                bgColor="#c2e0a3"
                label="신부에게 카톡하기"
              />
            </a>
          </>
        ) : (
          <>
            <a href="tel:01044495716" target="_blank" rel="noreferrer">
              <CallButton
                icon={<FaceSmileIcon />}
                bgColor="#abdaab"
                label="신랑(혼주)측에 연락하기"
              />
            </a>
            <a href="tel:01046808789" target="_blank" rel="noreferrer">
              <CallButton
                icon={<FaceSmileIcon />}
                bgColor="#c2e0a3"
                label="신부(혼주)측에 연락하기"
              />
            </a>
          </>
        )}
      </CallWrap>
      <SectionHr />

      <PhotoGrid>
        {photo.map((i) => (
          <li key={i}>
            <img
              role="button"
              src={`/photos/t${i}.jpg`}
              style={{ cursor: "pointer" }}
              loading="lazy"
              onClick={() => handlePhotoClick(i)}
            />
          </li>
        ))}
      </PhotoGrid>
      {showGalleryModal && (
        <Modal handleClose={handleGalleryModalClose}>
          <PhotoGallery
            src={photo}
            initialSlide={lastClickedGalleryItem}
            onClose={handleGalleryModalClose}
          />
        </Modal>
      )}
      <SectionHr />
      <SectionHeader>🧭 오시는 길</SectionHeader>
      <Image src={mapPic} width="333px" height="236px" alt="약도" />
      {/* 약도는 결혼식장 위치에 맞게 수정해주세요. 보통 식장에서 줍니다. */}

      <p style={{ margin: "30px 0" }}>
        <Image
          src={gravityLogo}
          width="188px"
          height="91px"
          alt="그래비티 서울 판교 오토그래프 컬렉션"
          style={{ display: "block" }}
        />
      </p>
      <p style={{ wordBreak: "keep-all" }}>
        경기도 성남시 분당구 판교역로146번길 2
        <br />
        그래비티 서울 판교 오토그래프 컬렉션 호텔, 지하1층 스페이스볼룸
        <br />
      </p>

      <MapButton href="https://place.map.kakao.com/1693881924">
        <MapPinIcon color="#FEE500" /> 카카오맵
      </MapButton>
      <MapButton href="https://naver.me/GMqwvuZY">
        <MapPinIcon color="#2DB400" /> 네이버지도
      </MapButton>
      <MapButton href="https://surl.tmobiapi.com/acf9d724">
        <MapPinIcon color="#d343c3" /> TMAP
      </MapButton>

      <p style={{ wordBreak: "keep-all" }}>
        <br />
        호텔 주차장 만차 시, 바로 옆 &apos;판교공영주차장&apos; 이용할 수
        있습니다. 나가실 때 주차권을 꼭 챙기세요.
        <br />
        <i style={{ fontSize: "8px", color: "#AAA" }}>
          (판교공영주차장, 경기도 성남시 분당구 판교역로146번길 8)
        </i>
      </p>

      <CalendarButton onClick={handleOnClickAddEvent}>
        <CalendarDaysIcon color="#ffffff" />
      </CalendarButton>

      <SectionHr />
      <SectionHeader>💸 마음 전하실 곳</SectionHeader>
      <GiveWrap>
        <p>
          <strong>신랑측</strong>
          <br />
          {explict ? (
            <>
              (김철원)&nbsp;
              <CopyText text="토스뱅크 1000-0022-2574" />
            </>
          ) : (
            <>
              (김영해)&nbsp;
              <CopyText text="경남은행 531-21-0404715" />
              <br />
              (정선주)&nbsp;
              <CopyText text="농협 815134-56-154391" />
              <br />
              (김철원)&nbsp;
              <CopyText text="토스뱅크 1000-0022-2574" />
            </>
          )}
        </p>
        <p>
          <strong>👰 신부측</strong>
          <br />
          {explict ? (
            <>
              (임지원)&nbsp;
              <CopyText text="신한은행 110-473-067308" />
            </>
          ) : (
            <>
              (고제성)&nbsp;
              <CopyText text="농협 301-0298-3874-81" />
              <br />
              (임지원)&nbsp;
              <CopyText text="신한은행 110-473-067308" />
            </>
          )}
        </p>
      </GiveWrap>

      {!hideBus ? (
        <>
          <SectionHr />
          <SectionHeader>🚌 전세버스 안내</SectionHeader>
          <GiveWrap>
            <p>
              <strong>울산 출발</strong>
              <br />

              <>
                05:30 방어진
                <br />
                05:50 태화호텔 건너편
                <br />
                06:00 신복로터리
                <br />
                06:05 범서읍사무소
                <br />
                06:20 언양읍사무소
                <br />
                06:30 경주 내남
                <br />
                <br />
                <p style={{ fontSize: 12, color: "#999" }}>
                  🚨 현재 전세버스 좌석이 만석으로 예상됩니다 🚨
                  <br />
                  전세버스 탑승을 원하시는 분은 혼주나 신랑에게 꼭 연락주세요
                </p>
                기사님 연락처
                <br />
                <CopyText
                  text="010-4582-7556"
                  placeholder="전화번호가 복사 되었습니다."
                />
                <br />
                (울산72바4259/대왕암관광)
              </>
            </p>
          </GiveWrap>
        </>
      ) : (
        <></>
      )}

      <SectionHr />
      <SectionHeader>축하의 한마디</SectionHeader>
      <WriteSectionSubHeader>
        <p>신랑측</p>
        <p>신부측</p>
      </WriteSectionSubHeader>
      <div style={{ clear: "both" }} />
      <TalkWrap>
        <WriteButtonTrigger ref={writeButtonTriggerRef} />
        {talkListResp?.talks.map((talk) => (
          <TalkBubble
            key={talk.id}
            talk={talk}
            selected={talk.id === selectedTalkId}
            onBubbleClick={handleTalkBubbleClick}
            onEditClick={handleTalkEditClick}
          />
        ))}
      </TalkWrap>
      <ThankYou>{writeDone ? "감사합니다." : ""}</ThankYou>
      {!writeDone && (
        <WriteButton
          visible={isWriteButtonShown}
          onClick={handleWriteButtonClick}
        >
          😍 나도 한마디
        </WriteButton>
      )}
      {showWriteTalkModal && (
        <Modal handleClose={handleWriteTalkModalClose}>
          <WriteTalk onWrite={handleWriteTalk} />
        </Modal>
      )}
      {showEditTalkModal && (
        <Modal handleClose={handleEditTalkModalClose}>
          <EditTalk talk={showEditTalkModal} onEdit={handleEditTalk} />
        </Modal>
      )}
    </Main>
  );
};

export default Home;
