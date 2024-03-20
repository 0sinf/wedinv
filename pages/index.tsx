import Head from 'next/head';
import React from 'react';

import Home from '@/components/home';

import { useRouter } from 'next/router';

const GROOM = '성도환';
const BRIDE = '정다운';

const HomePage = ({ photo }: { photo: number[] }) => {
  const { query } = useRouter();

  const { f, b } = query;
  //TODO:
  //청첩장에 특정 파라미터를 집어넣어서 친구에게 보낼 청첩장, 부모님 지인에게 보낼 청첩장을 구분했습니다.
  //어르신 용은 파라미터가 없고, 친구용은 f=1, 버스정보를 숨기려면 b=1을 넣어주세요.
  //결혼식이 그렇게 호락호락하지 않습니다. 이거는 가려야되고, 저거는 보여줘야되고,.......... 화이팅!
  //eg.
  //https://jiwon.chulwon.kim/ => 부모님용 기본버전
  //https://jiwon.chulwon.kim/?f=1 => 친구용
  //https://jiwon.chulwon.kim/?b=1 => 부모님용 그렇지만 버스정보가 숨겨짐

  // 다운님 버전
  /**
   * / 부모님용 기본버전
   * /?f=1 친구용
   * /?b=1 다운님 부모님 (전세버스)
   */

  const title = `${GROOM} ♡ ${BRIDE} 2024년 5월 5일에 결혼합니다.`;
  const subtitle = `${GROOM} ♡ ${BRIDE} 청첩장`;
  const description = `5월 5일 낮 1시 30분 @ 루이비스 웨딩홀 중구점 - 충정로역`;

  const domain = 'https://wedinv-eight.vercel.app/';
  return (
    <>
      <Head>
        <title>
          {GROOM} ♡ {BRIDE}
        </title>
        <meta name="description" content={title} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta name="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:title" content={subtitle} />
        <meta name="twitter:title" content={subtitle} />
        <meta name="format-detection" content="telephone=no" />

        <link rel="canonical" href={domain} />

        <meta property="og:description" content={description} />
        <meta name="twitter:description" content={description} />
        <meta property="og:image" content={`${domain}/photos/cover_row.jpg`} />
        <meta name="twitter:image" content={`${domain}/photos/cover_row.jpg`} />
        {/* opengraph는 배포 이후 URL로 다시 수정하시면 좋습니다. */}
      </Head>
      <Home photo={photo} explict={f === '1'} hideBus={b !== '1'} />
    </>
  );
};

export async function getServerSideProps() {
  //public/photos 폴더에 있는 파일 index로 결정 원본 g[n].jpg / 썸네일 t[n].jpg

  const portrait = [2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 16, 17, 18]; //g_2.jpg ~ g_18.jpg
  const landscape = [7, 8, 15, 19]; // g_7.jpg, g_8.jpg, g_15.jpg, g_19.jpg

  //고르고 싶은 사진이 너무 많아 랜덤으로 돌렸습니다. 랜덤 원치 않으시면 위에 갯수를 줄이시고, 아래 랜덤 코드 주석처리하세요
  let extract_landscape = landscape.sort(() => Math.random() - 0.5).slice(0, 2); //가로사진 2장
  let extract_portrait = portrait.sort(() => Math.random() - 0.5).slice(0, 10); //세로사진 10장

  //가로사진 1장, 세로사진 6장, 가로사진 1장, 세로사진 4장, 가로사진 1장

  const extract = Array(11)
    .fill(0)
    .map((_, idx) => idx + 1); //1번 사진은 고정, 나머지는 랜덤으로 고른 사진중에 배치.

  console.log(extract);

  return {
    props: {
      photo: extract,
    },
  };
}
export default HomePage;
