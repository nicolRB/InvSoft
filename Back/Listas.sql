-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: listas
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `coluna`
--

DROP TABLE IF EXISTS `coluna`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coluna` (
  `Id_Coluna` int(11) NOT NULL AUTO_INCREMENT,
  `Nome_Coluna` varchar(30) NOT NULL,
  `Lista` int(11) NOT NULL,
  PRIMARY KEY (`Id_Coluna`),
  KEY `Lista` (`Lista`),
  CONSTRAINT `coluna_ibfk_1` FOREIGN KEY (`Lista`) REFERENCES `lista` (`Id_Lista`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coluna`
--

LOCK TABLES `coluna` WRITE;
/*!40000 ALTER TABLE `coluna` DISABLE KEYS */;
INSERT INTO `coluna` VALUES (4,'Coluna 1',5),(5,'Coluna 2',5),(6,'Coluna 3',5);
/*!40000 ALTER TABLE `coluna` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 trigger nova_coluna
AFTER INSERT ON coluna
FOR EACH ROW
BEGIN
    INSERT INTO info (Dados, Lin, Col)
SELECT NULL, Id_Linha, NEW.Id_Coluna
    FROM linha
    WHERE Lista = NEW.Lista;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `conta`
--

DROP TABLE IF EXISTS `conta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conta` (
  `ID_Conta` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `Password_Hash` varchar(255) NOT NULL,
  `email` varchar(50) NOT NULL,
  PRIMARY KEY (`ID_Conta`),
  UNIQUE KEY `Username` (`Username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conta`
--

LOCK TABLES `conta` WRITE;
/*!40000 ALTER TABLE `conta` DISABLE KEYS */;
/*!40000 ALTER TABLE `conta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `info`
--

DROP TABLE IF EXISTS `info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `info` (
  `Id_Info` int(11) NOT NULL AUTO_INCREMENT,
  `Dados` varchar(500) DEFAULT NULL,
  `Lin` int(11) NOT NULL,
  `Col` int(11) NOT NULL,
  PRIMARY KEY (`Id_Info`),
  KEY `Lin` (`Lin`),
  KEY `Col` (`Col`),
  CONSTRAINT `info_ibfk_1` FOREIGN KEY (`Lin`) REFERENCES `linha` (`Id_Linha`),
  CONSTRAINT `info_ibfk_2` FOREIGN KEY (`Col`) REFERENCES `coluna` (`Id_Coluna`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info`
--

LOCK TABLES `info` WRITE;
/*!40000 ALTER TABLE `info` DISABLE KEYS */;
INSERT INTO `info` VALUES (4,'1',2,4),(5,'2',2,5),(6,NULL,2,6);
/*!40000 ALTER TABLE `info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `linha`
--

DROP TABLE IF EXISTS `linha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `linha` (
  `Id_Linha` int(11) NOT NULL AUTO_INCREMENT,
  `Num` int(11) NOT NULL,
  `Lista` int(11) NOT NULL,
  PRIMARY KEY (`Id_Linha`),
  KEY `Lista` (`Lista`),
  CONSTRAINT `linha_ibfk_1` FOREIGN KEY (`Lista`) REFERENCES `lista` (`Id_Lista`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `linha`
--

LOCK TABLES `linha` WRITE;
/*!40000 ALTER TABLE `linha` DISABLE KEYS */;
INSERT INTO `linha` VALUES (2,1,5);
/*!40000 ALTER TABLE `linha` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER nova_linha
after insert on linha
FOR EACH ROW
BEGIN
    INSERT INTO info (Dados, Lin, Col)
SELECT NULL, NEW.Id_Linha, Id_Coluna
from coluna
where lista = new.lista;
end */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `lista`
--

DROP TABLE IF EXISTS `lista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lista` (
  `Id_Lista` int(11) NOT NULL AUTO_INCREMENT,
  `Nome_Lista` varchar(30) NOT NULL,
  `Pasta` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id_Lista`),
  KEY `Pasta` (`Pasta`),
  CONSTRAINT `lista_ibfk_1` FOREIGN KEY (`Pasta`) REFERENCES `pasta` (`Id_Pasta`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lista`
--

LOCK TABLES `lista` WRITE;
/*!40000 ALTER TABLE `lista` DISABLE KEYS */;
INSERT INTO `lista` VALUES (5,'Teste',NULL);
/*!40000 ALTER TABLE `lista` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER nova_lista 
AFTER INSERT ON lista 
FOR EACH ROW
BEGIN
    INSERT INTO linha (Num, Lista) 
    VALUES (1, NEW.Id_Lista);

    INSERT INTO coluna (Nome_Coluna, Lista) 
    VALUES 
        ('Coluna 1', NEW.Id_Lista),
        ('Coluna 2', NEW.Id_Lista),
        ('Coluna 3', NEW.Id_Lista);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `pasta`
--

DROP TABLE IF EXISTS `pasta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pasta` (
  `Id_Pasta` int(11) NOT NULL AUTO_INCREMENT,
  `Nome_Pasta` varchar(30) NOT NULL,
  PRIMARY KEY (`Id_Pasta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pasta`
--

LOCK TABLES `pasta` WRITE;
/*!40000 ALTER TABLE `pasta` DISABLE KEYS */;
/*!40000 ALTER TABLE `pasta` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-14 16:31:53
