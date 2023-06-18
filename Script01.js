/*

checks only store the test cases

Thresholds will stop the esceution based on checks

Thresholds on groups will decide the pass/fail for group

we can combine multiple api's in groups

//ex LOOks like

 group_duration.....: avg=157.39ms min=126.93ms med=134.46ms max=479.36ms p(90)=140.6ms  p(95)=451.87ms

 This contails the duration of all groups

 Trend is used to measure the timimg for individual group metrics

 groupDuration....................: avg=164.261538 min=125      med=134      max=498      p(90)=164.2    p(95)=461.55  
     ✓ { groupName:groupGetGroups }...: avg=141.876923 min=125      med=134      max=498      p(90)=147      p(95)=153.4   
     ✓ { groupName:groupGetUsers }....: avg=186.646154 min=127      med=135      max=477      p(90)=461      p(95)=468.4   

*/

import http from 'k6/http'
import { Rate,Trend } from 'k6/metrics'
import { sleep, group, check, fail } from 'k6'

//Declare Variable for errors

export let errorRate = new Rate('errors')

//Declare Trend for timimgs for each group metrics

let groupDuration =Trend('groupDuration')

//Declare the cloud token to thr grafana project to store the results


//Define Options

export let options = {
    vus: 10,
    duration: '15s',
  
    thresholds: {
      errors: ['rate < 0.1'], // 10% of errors acceptable
      'groupDuration{groupName:groupGetUsers}': ['avg < 300'],
      'groupDuration{groupName:groupGetGroups}': ['avg < 300'],
    },
  
    ext: {
      loadimpact: {
        // Project: CloudTest
        projectID: 3646337,
        // Test runs with the same name groups test runs together
        name: 'Test1',
      },
    },
  };

export default function(){
    
    //____________API-1_________________ API returns the list of the users

    groupWithMetrics('groupGetUsers', function() {

    const responseGetUsers = http.get("https://run.mocky.io/v3/440cb5f7-64fc-4ea7-a04a-7ba553f420d0");
    
    //Tags on Checks
    const checkGetUsers = check(responseGetUsers,{
        'is status equal 200' : r => r.status === 200,  // r means response

    })

    //Define error rate

    errorRate.add(!checkGetUsers)
    })
        //____________API-2_________________ API returns the list of the groups

        groupWithMetrics('groupGetGroups', function(){

        const responseGetGroups = http.get("https://run.mocky.io/v3/6610f486-4111-42cd-bf19-c2c2e8116fc2");

        //Tags On checks
        const checkGetGroups = check(responseGetGroups,{
            'is status equal 200' : r => r.status === 200,  // r means response

        })
    
        errorRate.add(!checkGetGroups)

    })

    //Define The function which Measures the Timings

    function groupWithMetrics(nameOfGroup, groupFunction){
       
        //start time
        let start = new Date();

        //call group

        group(nameOfGroup, groupFunction)

        //End Time

        let end = new Date();
       
        //Add the Trend Timing
        groupDuration.add(end - start, { groupName: nameOfGroup }); // Update the tag name

    }
}

/*

Locally

//D:\Script01.js

*/

