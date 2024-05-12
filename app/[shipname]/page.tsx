import { Banner } from "@/components/Banner";
import { Debug } from "@/components/Debug";
import { FittingWindow } from "@/components/FittingWindow/FittingWindow";
import { ESF_DATA_VERSION } from "@eveshipfit/data";
import React from "react";
import { Metadata } from "next";

interface ShipTypeInfo {
  id: number;
  name: string;
  group: string;
}

interface PageParams {
  shipname: string;
}

const getShipTypes = async () => {
  return (await fetch(`https://data.eveship.fit/v${ESF_DATA_VERSION}/shiptypes.json`).then((res) =>
    res.json(),
  )) as ShipTypeInfo[];
};

const getCurrentShipType = async (shipname: string): Promise<ShipTypeInfo | undefined> => {
  const shipTypes = await getShipTypes();

  return shipTypes.find(({ name }) => name.toLowerCase() === shipname.toLowerCase());
};

export async function generateStaticParams() {
  const shipTypes = await getShipTypes();

  return shipTypes.map(
    ({ name }) =>
      ({
        shipname: name.toLowerCase(),
      }) as PageParams,
  );
}

export async function generateMetadata({ params: { shipname } }: { params: PageParams }): Promise<Metadata> {
  const currentShipType = await getCurrentShipType(shipname);

  if (!currentShipType) return {};

  const { id, name, group } = currentShipType;

  const imageUrl = `https://images.evetech.net/types/${id}/render?size=512`;

  return {
    title: `${name} (${group})`,
    openGraph: {
      type: "website",
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      images: [{ url: imageUrl }],
    },
  };
}

export default function Page() {
  return (
    <>
      <Banner />
      <FittingWindow />
      <Debug />
    </>
  );
}
