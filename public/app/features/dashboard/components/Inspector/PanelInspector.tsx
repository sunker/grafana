// Libraries
import React, { PureComponent } from 'react';

import { DashboardModel, PanelModel } from 'app/features/dashboard/state';
import { JSONFormatter, Modal } from '@grafana/ui';
import { css } from 'emotion';
import { getLocationSrv, getDataSourceSrv } from '@grafana/runtime';
import { DataFrame, MetadataInspectorProps } from '@grafana/data';

interface Props {
  dashboard: DashboardModel;
  panel: PanelModel;
}

interface State {
  meta?: MetadataInspectorProps<any, any, any>;
}

export class PanelInspector extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  async componentDidMount() {}

  async componentDidUpdate(prevProps: Props) {}

  updateMeta() {
    const { panel } = this.props;
    if (!panel) {
      this.onDismiss(); // Try to close the component
      return null;
    }

    // TODO? should we get the result with an observable once?
    const data = (panel.getQueryRunner() as any).lastResult;
    const inspectable = getInspectableMetadata(data?.series as DataFrame[]);
    console.log('TODO', inspectable);
  }

  onDismiss = () => {
    getLocationSrv().update({
      query: { inspect: null },
      partial: true,
    });
  };

  renderInspectable(meta: Record<string, DataFrame[]>) {
    for (const key in inspectable) {
      // const ds = await getDataSourceSrv().get(key);
      // if (ds) {
      //   console.log('TODO, inspect', ds);
      //   return <div>TODO... show inspector...</div>;
      // }
    }
    return <></>;
  }

  render() {
    const { panel } = this.props;
    const { meta } = this.state;
    if (!panel) {
      this.onDismiss(); // Try to close the component
      return null;
    }
    const bodyStyle = css`
      max-height: 70vh;
      overflow-y: scroll;
    `;

    // TODO? should we get the result with an observable once?
    const data = (panel.getQueryRunner() as any).lastResult;
    return (
      <Modal title={panel.title} icon="fa fa-info-circle" onDismiss={this.onDismiss} isOpen={true}>
        {meta && this.renderInspectable(meta)}
        <div className={bodyStyle}>
          <JSONFormatter json={data} open={2} />
        </div>
      </Modal>
    );
  }
}

export function getInspectableMetadata(data: DataFrame[]): Record<string, DataFrame[]> | undefined {
  if (!data || !data.length) {
    return undefined;
  }

  let found = false;
  const grouped: Record<string, DataFrame[]> = {};
  for (const frame of data) {
    const id = frame.meta?.ds?.datasourceName;
    if (id) {
      if (!grouped[id]) {
        grouped[id] = [];
      }
      grouped[id].push(frame);
      found = true;
    }
  }
  if (found) {
    return grouped;
  }
  return undefined;
}
