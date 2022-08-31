import { View, Text, StyleSheet, Button, SafeAreaView, Image, FlatList, TextInput } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import DropDownPicker from 'react-native-dropdown-picker'
import axios from 'axios'
import DatePicker from 'react-native-date-picker'

const ListItem = ({ observation }) => {
  return(
        <View style={styles.itemContainer}>
            <Image
                source={observation.photos[0]}
                style={styles.image}
            />
            <View style={styles.titleContainer}>
                <Text style={styles.title}>
                  {observation.taxon?.name || observation.species_guess} By {observation.user.name || observation.user.login}
                  {"\n"}
                  Observed on {observation.observed_on_details.date}
                </Text>
            </View>
        </View>
  )
}

const App = () => {
  const [observations, setObservations] = useState([])
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    {label: 'All', value: 'all'},
    {label: 'Before', value:'before'},
    {label:'Exactly At', value:'at'},
    {label:'After', value:'after'}
  ])
  const parseDate = (date) => {
    let parse = date.split('-');
    let output = parse.join('');
    return Number(output)
  }
  useEffect(() => {
    axios.get('https://api.inaturalist.org/v1/observations')
    .then((res) => {
      setObservations(res.data.results)
    })
  }, [])
  const filteredItems = useMemo(() => {
    let searchDate = parseDate(search)
    if(!isNaN(searchDate)){
      let searchItems = observations.slice();
      switch(value){
        case "all":
          return observations;
        case "before":
          let filteredBeforeSearch = searchItems.filter((item) => {
            return parseDate(item.observed_on_details.date) < searchDate;
          })
          return filteredBeforeSearch;
        case "at":
            let filteredAtSearch = searchItems.filter((item) => {
              return parseDate(item.observed_on_details.date) === searchDate;
            })
            return filteredAtSearch;
        case "after":
            let filteredAfterSearch = searchItems.filter((item) => {
              return parseDate(item.observed_on_details.date) > searchDate;
            })
            return filteredAfterSearch;
      }
    }
  },[search])
  const onSubmit = () => {
    setSearch(filter)
  }
  return (
    <SafeAreaView style={styles.container}>
        <DropDownPicker 
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              containerStyle={{width:300, alignSelf:'center'}}
            />
        <View>
          <TextInput 
          style={styles.input}
          placeholder='YYYY-MM-DD'
          onChangeText={setFilter}
          onSubmitEditing={onSubmit}
          />
          <Button title="Search" onPress={onSubmit}/>
        </View>
      <FlatList 
        contentContainerStyle={{flexGrow: 1}}
        data={filteredItems ? filteredItems : observations}
        renderItem={({item}) => (
          item.photos?.length > 0 &&
          <ListItem observation={item}/>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  itemContainer: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
    elevation: 8,
    width:350,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    flexDirection: 'row'
},
image: {
    width: 80,
    height: 80,
    borderRadius: 10
},
titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
title: {
    flexWrap: 'wrap',
    marginHorizontal: 10,
},
  container:{
    justifyContent:'center',
    alignItems:'center',
    flex:1,
    marginTop:50,
  },
  postContainer: {
    marginTop:10,
  },
  input: {
    height: 40,
    width:300,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    alignSelf:'center'
  },
  headerContainer:{
    width:350,
  }
})

export default App