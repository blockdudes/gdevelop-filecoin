// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import FlatButton from '../../UI/FlatButton';
import { Column, Line, Spacer } from '../../UI/Grid';
import AlertMessage from '../../UI/AlertMessage';
import ItchIo from '../../UI/CustomSvgIcons/ItchIo';
import GameJolt from '../../UI/CustomSvgIcons/GameJolt';
import Poki from '../../UI/CustomSvgIcons/Poki';
import CrazyGames from '../../UI/CustomSvgIcons/CrazyGames';
import NewsGround from '../../UI/CustomSvgIcons/NewsGround';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import Check from '../../UI/CustomSvgIcons/Check';
import Help from '../../UI/CustomSvgIcons/Help';
import RaisedButton from '../../UI/RaisedButton';
import { type ExportFlowProps } from '../ExportPipeline.flow';
import { Web3ProviderContext } from '../../Context/Store';
import { Input } from '@material-ui/core';

const getIconStyle = ({ isMobile }: {| isMobile: boolean |}) => {
  return {
    height: isMobile ? 30 : 48,
    width: isMobile ? 30 : 48,
    margin: 10,
  };
};

export const ExplanationHeader = () => {
  const { isMobile } = useResponsiveWindowSize();
  const iconStyle = getIconStyle({ isMobile });

  const { walletConnect, setGameData, gameData } = React.useContext(
    Web3ProviderContext
  );
  React.useEffect(() => {
    walletConnect();
  }, []);

  console.log('gameData', gameData);
  return (
    <Column noMargin>
      <Line>
        <Text align="center">
          <Input
            type="text"
            placeholder="Enter your game name..."
            value={gameData.name}
            onChange={e => setGameData({ ...gameData, name: e.target.value })}
          />
        </Text>
      </Line>

      <Line>
        <Text align="center">
          <Input
            type="text"
            placeholder="Enter your game price..."
            value={gameData.price}
            onChange={e => setGameData({ ...gameData, price: e.target.value })}
          />
        </Text>
      </Line>
    </Column>
  );
};

type HTML5ExportFlowProps = {|
  ...ExportFlowProps,
  exportPipelineName: string,
|};

export const ExportFlow = ({
  disabled,
  launchExport,
  isExporting,
  exportPipelineName,
  exportStep,
}: HTML5ExportFlowProps) =>
  exportStep !== 'done' ? (
    <Line justifyContent="center">
      <RaisedButton
        label={
          !isExporting ? (
            <Trans>upload to filecoin</Trans>
          ) : (
            <Trans>uploading...</Trans>
          )
        }
        primary
        id={`launch-export-${exportPipelineName}-button`}
        onClick={launchExport}
        disabled={disabled || isExporting}
      />
    </Line>
  ) : null;

export const DoneFooter = ({
  renderGameButton,
}: {|
  renderGameButton: () => React.Node,
|}) => {
  const openLearnMore = () => {
    Window.openExternalURL(
      getHelpLink(
        '/publishing/html5_game_in_a_local_folder/#3rd-party-hosting-sites'
      )
    );
  };

  return (
    <Column noMargin alignItems="center">
      <LineStackLayout noMargin justifyContent="center" alignItems="center">
        <Check fontSize="small" />
        <Text>
          <Trans>Done!</Trans>
        </Text>
      </LineStackLayout>
      <Text>
        <Trans>
          You can now upload the game to a web hosting service to play it.
        </Trans>
      </Text>
      <Spacer />
      <ColumnStackLayout justifyContent="center">
        <Line justifyContent="center">{renderGameButton()}</Line>
        <FlatButton
          label={<Trans>Learn more about publishing to platforms</Trans>}
          primary
          onClick={openLearnMore}
          leftIcon={<Help />}
        />
      </ColumnStackLayout>
      <Spacer />
      <Line>
        <AlertMessage kind="info">
          <Trans>
            Your game won't work if you open the index.html file on your
            computer. You must upload it to a web hosting platform (Itch.io,
            Poki, CrazyGames etc...) or a web server to run it.
          </Trans>
        </AlertMessage>
      </Line>
    </Column>
  );
};

export const html5Exporter = {
  key: 'webexport',
  tabName: <Trans>Web</Trans>,
  name: <Trans>HTML5</Trans>,
  helpPage: '/publishing/html5_game_in_a_local_folder',
};
