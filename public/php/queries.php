<!-- Queries File -->
<?php

require(dirname(__FILE__).'/config.php');

class Queries{

    protected $connection;
     
    public function __construct(){
        
        $this->connection = Connection::db();
    }
   
    public function saveMovement($request){

        $email = $request->customer->email;
        $name = $request->customer->name;
        $phone = $request->customer->phone;
        $card = $request->customer->card;
     
        $saveUser = "INSERT INTO `users`(`email`, `name`, `phone`, `card`, `status`) VALUES ('$email','$name','$phone','$card','1')";

         $this->connection->query($saveUser);
        
         $idUser = $this->connection->insert_id;
           

         foreach($request->product as $value){
            $idProduct = $value->idProduct;
            $unit = $value->unit;
            $price = $value->price;
            $query = "INSERT INTO `movements`(`idProduct`, `idUser`, `unit`, `price`) VALUES ('$idProduct','$idUser','$unit','$price')";
            $this->connection->query($query);
        }
    }
    public function showProducts(){

 
        $query="SELECT `idProduct`, `name`, `description`, `large`, `height`, `width`, `price`, `thumbnailUrl`, `state`, `gallery` FROM `products`";
        $res = $this->connection->query($query);
        $arrProducts= array();
            while ($row = mysqli_fetch_object($res)) {
                $objProducts = new stdClass();
                $arrGallery = explode(",",$row->gallery);
                $objProducts->idProduct = $row->idProduct;
                $objProducts->name = $row->name;
                $objProducts->description = $row->description;
                $objProducts->large = $row->large;
                $objProducts->height = $row->height;
                $objProducts->width = $row->width;
                $objProducts->price = $row->price;
                $objProducts->thumbnailUrl = $row->thumbnailUrl;
                $objProducts->state = $row->state;
                $objProducts->gallery = $arrGallery;
                array_push($arrProducts,$objProducts);
            }
        return $arrProducts;
    }
}

