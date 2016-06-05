'use strict';

import React, {
  Text,
  View,
  ListView
} from 'react-native';

import union from 'lodash.union';

import {forceClient} from 'react.force';

import {requestWithTypeAndId} from 'react.force.data';

module.exports = React.createClass ({
  getDefaultProps(){
    return {
      type:null,
      fields:[],
      where:null,
      limit:200,
      refreshDate:new Date(),
      style:{}
    };
  },
  childContextTypes: {
    dataSource: React.PropTypes.object
  },
  getInitialState(){
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      loading:false,
      dataSource: ds.cloneWithRows([])
    };
  },
  getChildContext() {
    return {
      dataSource: this.state.dataSource
    };
  },
  componentDidMount(){
    this.getData();
  },
  getDataSource (items) {
    return this.state.dataSource.cloneWithRows(items);
  },
  getQuery() {
    if(!this.props.type) return;
    const fields = union(['Id'],this.props.fields);
    let soql = 'SELECT '+ fields.join(', ') + ' FROM '+this.props.type;
    if(this.props.where){
      soql += ' WHERE '+this.props.where;
    }
    soql += ' LIMIT '+this.props.limit;
    return soql;
  },
  getData() {
    const soql = this.getQuery();
    if(!soql){
      return;
    }
    this.setState({loading:true});
    forceClient.query(soql,
      (response) => {
        const items = response.records;
        items.forEach((item)=>{
          requestWithTypeAndId(this.props.type,item.Id);
        });
        this.setState({
          dataSource: this.getDataSource(items)
        });
      });
  },

  render() {
    return (
      <View style={[this.props.style]}>
        {this.props.children}
      </View>
    )
  },
  componentWillReceiveProps(newProps){
    if(this.props.refreshDate !== newProps.refreshDate){
      this.getData();
    }
  },
});
