"use client";

import {
  CurrentCharacterProvider,
  CurrentFitProvider,
  DefaultCharactersProvider,
  DogmaEngineProvider,
  EsiCharactersProvider,
  EveDataProvider,
  FitManagerProvider,
  LocalFitsProvider,
  ModalDialogAnchor,
  StatisticsProvider,
} from "@eveshipfit/react";
import React from "react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <EveDataProvider>
      <DogmaEngineProvider>
        <CurrentFitProvider>
          <LocalFitsProvider>
            <DefaultCharactersProvider>
              <EsiCharactersProvider>
                <CurrentCharacterProvider>
                  <StatisticsProvider>
                    <FitManagerProvider>
                      <ModalDialogAnchor />
                      {children}
                    </FitManagerProvider>
                  </StatisticsProvider>
                </CurrentCharacterProvider>
              </EsiCharactersProvider>
            </DefaultCharactersProvider>
          </LocalFitsProvider>
        </CurrentFitProvider>
      </DogmaEngineProvider>
    </EveDataProvider>
  );
};
