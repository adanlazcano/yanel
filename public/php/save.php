<!-- Logic of site -->
<?php
require(dirname(__FILE__) . '/openpay-php-master/Openpay.php');
require(dirname(__FILE__).'/queries.php');

$request = file_get_contents('php://input');
$request = json_decode($request);
$save = New Queries();

$save->saveMovement($request);
//simulated instance (key secret)
$openpay = Openpay::getInstance('xxxxxxxxxxx', 'xxxxxxxx');
$customer = array(
     'name' => $request->customer->name,
     'phone_number' => $request->customer->phone,
     'email' => $request->customer->email);

$chargeRequest = array(
    'method' => 'card',
    'source_id' => $request->tokenId,
    'amount' => $request->total,
    'currency' => 'MXN',
    'description' => 'Compra de '.$request->customer->name,
    'device_session_id' => $request->deviceSessionId,
    'customer' => $customer);

$charge = $openpay->charges->create($chargeRequest);

?>