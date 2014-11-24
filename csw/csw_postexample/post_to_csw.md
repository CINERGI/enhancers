Examples of using the CSW Endpoint to send and retrieve data:

Examples:
1. Get A Record By ID (GetByID)
1. Update or insert a record (Transaction)

A normal method is to call get capabilties, and to then figure out the Enpoint URL> Not really needed but the deteails are below:

CSW Get Capabilities Endpoint:
http://hydro10.sdsc.edu:8080/geoportal/csw/discovery?Request=GetCapabilities&Service=CSW&Version=2.0.2

CSW Transaction Endpoint:
 http://hydro10.sdsc.edu:8080/geoportal/csw
 
xpath: `/csw:Capabilities/ows:OperationsMetadata[1]/ows:Operation[5]/ows:DCP[1]/ows:HTTP[1]/ows:Post[1]/@*[namespace-uri()='http://www.w3.org/1999/xlink' and local-name()='href']` 

- - -
GetByID:
The record ID is the `<gmd:fileIdentifier>` eg 
gov.noaa.ncdc:C00867

```
curl -u gptaccount --data-binary @get_record_by_post.xml http://hydro10.sdsc.edu:8080/geoportal/csw
```
 

- - -
Transaction:
Post Insert (or update):

```
curl -v -u gptaccount --data @0501C1B5-8614-4CA3-8556-D305EF3D4ECA_transaction_insert.xml http://hydro10.sdsc.edu:8080/geoportal/csw
```
Post data:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<csw:Transaction xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" version="2.0.2" service="CSW">
  <csw:Update>
    <!-- METADATA WITOUT XML LEAD HERE -->
   </<csw:Update>
</csw:Transaction>
```

Respose:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<csw:TransactionResponse xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" version="2.0.2">
   <csw:TransactionSummary>
   <csw:totalInserted>0</csw:totalInserted>
   <csw:totalUpdated>1</csw:totalUpdated>
   <csw:totalDeleted>0</csw:totalDeleted>
</csw:TransactionSummary>
```


- - -
Page from Geonetwork with More details:
http://geonetwork-opensource.org/manuals/trunk/eng/developer/xml_services/csw_services.html#transaction





