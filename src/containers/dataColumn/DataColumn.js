import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import DragDrop from '../../components/dragDrop/DragDrop/DragDrop';
import DataAxes from '../dataAxes/DataAxes';
import { groupBy } from 'lodash';
import PropTypes from 'prop-types';
import { DIMENTION, MEASURE, FUNCTION, DRAGABLE, DROPPABLE } from '../../utils/constants'


/**
 * DataColumn component which contain all the dragable items
 * @param  {Object} axesData Object containing the data for the droped items ( X-Y ) Axes 
 * @param  {Array} columnData Array containing all the data for the dragable data
 * @param  {Function} setAxesData used to set the droped Axis object in parent compnent
 * @param  {Function} setcolumnData used to set the draged column data after dragging from it 
 * @param  {Array} orginalColumnDataList used to set the orginal restore the orginal data order again when clearing the data
 * 
 */
const DataColumn = React.forwardRef(({
    axesData,
    columnData,
    setAxesData,
    setcolumnData,
    orginalColumnDataList
}, axesContainerRef) => {

    const getsourceListName = (source) => {
        if (source === 'dimensionContainer') return DIMENTION
        if (source === 'measureContainer') return MEASURE
        return '';
    }
    const getDroppedFieldData = (destinationField) => {
        return axesData.find(item => item.function === destinationField)
    }
    const handleOnDragEnd = useCallback((result) => {
        const { source, destination } = result;
        if (!result.destination || (destination.droppableId === source.droppableId)) return;
        const droppedFieldData = getDroppedFieldData(destination.droppableId)
        const sourceListName = getsourceListName(source.droppableId);
        const copyiedData = { ...columnData }
        const copiedAxesData = [...axesData];
        const copiedColumnDataObjectItems = copyiedData[sourceListName];
        const selectedItem = columnData[sourceListName][source.index];

        if (droppedFieldData) {
            copiedColumnDataObjectItems.splice(source.index, 1, droppedFieldData);
            const filteredAxesData = axesData.filter((AixsData) => AixsData.name !== droppedFieldData.name)
            const newAxesData = [...filteredAxesData, selectedItem];
            const filterAxesData = [...new Set(newAxesData)];
            setcolumnData(copyiedData);
            setAxesData(filterAxesData);
        } else {
            copiedColumnDataObjectItems.splice(source.index, 1);
            const newAxesData = [...copiedAxesData, selectedItem];
            const filterAxesData = [...new Set(newAxesData)];
            setcolumnData(copyiedData);
            setAxesData(filterAxesData);
        }
    }, [columnData, axesData]);
    const getMatchedAxesData = (listName) => {
        return axesData.find((axesData) => axesData.function === listName) // can be map in the future incase of muilt axes
    }
    const handleDeleteMeasure = (DeletedItem) => {
        const groupedOrginalDataColumn = groupBy(orginalColumnDataList, FUNCTION);
        const getDeletedItemOrginalList = groupedOrginalDataColumn[DeletedItem.function];
        const measureName = DeletedItem.function;
        const orginalColumnDataLists = { ...columnData, [measureName]: getDeletedItemOrginalList };
        const newAxesData = [...axesData]
        const filteredAxesData = newAxesData.filter((AixsData) => AixsData.name !== DeletedItem.name)
        setcolumnData(orginalColumnDataLists); // reset and sort with the orginal order
        setAxesData(filteredAxesData);
    }
    return (
        <div className="DataColumnContainer">
            {Object.entries(columnData).length ? Object.entries(columnData).map((dataList) => {
                const listName = dataList[0];
                return (
                    <div key={listName} className="DataColumnContainer-box" data-test='DataColumnContainer-box' >
                        <DragDropContext onDragEnd={data => handleOnDragEnd(data)} >
                            <div className="DragHeaderContainer">
                                <h6 className="DragHeaderContainer__Text" data-test='list-name'>
                                    {listName}
                                </h6>
                            </div>
                            <DragDrop actionType={DROPPABLE} droppableId={`${listName}Container`}>
                                <DragDrop actionType={DRAGABLE} itemsList={dataList[1]} />
                            </DragDrop>
                            {axesContainerRef && ReactDOM.createPortal(<DataAxes header={listName} axesData={getMatchedAxesData(listName)} handleDeleteMeasure={handleDeleteMeasure} />, axesContainerRef.current)}
                        </DragDropContext>
                    </div>
                )
            }): <p className="DataColumnContainer__Empty">Empty chart Data</p>}
        </div>
    )
})
DataColumn.defaultProps = {
    axesData: {},
    columnData: [],
    orginalColumnDataList: []
}
DataColumn.prototype = {
    axesContainerRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
    axesData: PropTypes.shape({
        name: PropTypes.string,
        values: PropTypes.string,
    }),
    columnData: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        values: PropTypes.arrayOf(String)
    })),
    setAxesData: PropTypes.func.isRequired,
    setcolumnData: PropTypes.func.isRequired,
    orginalColumnDataList: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        values: PropTypes.arrayOf(String)
    }))

}
export default DataColumn;