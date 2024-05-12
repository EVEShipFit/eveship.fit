"use client";

import {
  ShipSnapshotProvider,
  EsiProvider,
  LocalFitProvider,
  DogmaEngineProvider,
  EveDataProvider,
} from "@eveshipfit/react";
import React from "react";

export const FittingProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <EveDataProvider>
      <DogmaEngineProvider>
        <ShipSnapshotProvider>
          <EsiProvider>
            <LocalFitProvider>{children}</LocalFitProvider>
          </EsiProvider>
        </ShipSnapshotProvider>
      </DogmaEngineProvider>
    </EveDataProvider>
  );
};
