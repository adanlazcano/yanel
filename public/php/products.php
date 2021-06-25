<!-- showProducts File -->
<?php 

require(dirname(__FILE__).'/queries.php');
  $show = New Queries();
    echo json_encode($show->showProducts());
?>