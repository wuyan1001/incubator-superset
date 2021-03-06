import { Provider } from 'react-redux';
import React from 'react';
import { mount } from 'enzyme';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import Chart from '../../../../../src/dashboard/containers/Chart';
import ChartHolder from '../../../../../src/dashboard/components/gridComponents/ChartHolder';
import DeleteComponentButton from '../../../../../src/dashboard/components/DeleteComponentButton';
import DragDroppable from '../../../../../src/dashboard/components/dnd/DragDroppable';
import HoverMenu from '../../../../../src/dashboard/components/menu/HoverMenu';
import ResizableContainer from '../../../../../src/dashboard/components/resizable/ResizableContainer';

import { mockStore } from '../../fixtures/mockStore';
import { sliceId } from '../../fixtures/mockSliceEntities';
import { dashboardLayout as mockLayout } from '../../fixtures/mockDashboardLayout';
import WithDragDropContext from '../../helpers/WithDragDropContext';

describe('ChartHolder', () => {
  const props = {
    id: String(sliceId),
    parentId: 'ROW_ID',
    component: mockLayout.present.CHART_ID,
    depth: 2,
    parentComponent: mockLayout.present.ROW_ID,
    index: 0,
    editMode: false,
    availableColumnCount: 12,
    columnWidth: 50,
    onResizeStart() {},
    onResize() {},
    onResizeStop() {},
    handleComponentDrop() {},
    updateComponents() {},
    deleteComponent() {},
  };

  function setup(overrideProps) {
    // We have to wrap provide DragDropContext for the underlying DragDroppable
    // otherwise we cannot assert on DragDroppable children
    const wrapper = mount(
      <Provider store={mockStore}>
        <WithDragDropContext>
          <ChartHolder {...props} {...overrideProps} />
        </WithDragDropContext>
      </Provider>,
    );
    return wrapper;
  }

  it('should render a DragDroppable', () => {
    const wrapper = setup();
    expect(wrapper.find(DragDroppable)).to.have.length(1);
  });

  it('should render a ResizableContainer', () => {
    const wrapper = setup();
    expect(wrapper.find(ResizableContainer)).to.have.length(1);
  });

  it('should only have an adjustableWidth if its parent is a Row', () => {
    let wrapper = setup();
    expect(wrapper.find(ResizableContainer).prop('adjustableWidth')).to.equal(
      true,
    );

    wrapper = setup({ ...props, parentComponent: mockLayout.present.CHART_ID });
    expect(wrapper.find(ResizableContainer).prop('adjustableWidth')).to.equal(
      false,
    );
  });

  it('should pass correct props to ResizableContainer', () => {
    const wrapper = setup();
    const resizableProps = wrapper.find(ResizableContainer).props();
    expect(resizableProps.widthStep).to.equal(props.columnWidth);
    expect(resizableProps.widthMultiple).to.equal(props.component.meta.width);
    expect(resizableProps.heightMultiple).to.equal(props.component.meta.height);
    expect(resizableProps.maxWidthMultiple).to.equal(
      props.component.meta.width + props.availableColumnCount,
    );
  });

  it('should render a div with class "dashboard-component-chart-holder"', () => {
    const wrapper = setup();
    expect(wrapper.find('.dashboard-component-chart-holder')).to.have.length(1);
  });

  it('should render a Chart', () => {
    const wrapper = setup();
    expect(wrapper.find(Chart)).to.have.length(1);
  });

  it('should render a HoverMenu with DeleteComponentButton in editMode', () => {
    let wrapper = setup();
    expect(wrapper.find(HoverMenu)).to.have.length(0);
    expect(wrapper.find(DeleteComponentButton)).to.have.length(0);

    // we cannot set props on the Divider because of the WithDragDropContext wrapper
    wrapper = setup({ editMode: true });
    expect(wrapper.find(HoverMenu)).to.have.length(1);
    expect(wrapper.find(DeleteComponentButton)).to.have.length(1);
  });

  it('should call deleteComponent when deleted', () => {
    const deleteComponent = sinon.spy();
    const wrapper = setup({ editMode: true, deleteComponent });
    wrapper.find(DeleteComponentButton).simulate('click');
    expect(deleteComponent.callCount).to.equal(1);
  });
});
