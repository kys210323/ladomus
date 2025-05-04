-- MariaDB dump 10.19  Distrib 10.5.25-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: ladomus
-- ------------------------------------------------------
-- Server version    10.5.25-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/* -- Removed the lines about @OLD_SQL_NOTES and SQL_NOTES, because MySQL 8.0 doesn't support them. */

--
-- Table structure for table `boards`
--

DROP TABLE IF EXISTS `boards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `boards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boards`
--

LOCK TABLES `boards` WRITE;
/*!40000 ALTER TABLE `boards` DISABLE KEYS */;
INSERT INTO `boards` VALUES
 (1,'공지사항','공지 및 알림 게시판','2025-04-04 22:41:53','2025-04-04 22:41:53',NULL);
/*!40000 ALTER TABLE `boards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `originalName` varchar(255) DEFAULT NULL,
  `filePath` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files` DISABLE KEYS */;
/*!40000 ALTER TABLE `files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` mediumtext NOT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `type` enum('page','board') NOT NULL DEFAULT 'page',
  `parentId` int(11) DEFAULT NULL,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `template` varchar(50) DEFAULT 'default',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES
 (2,'INTRODUCTION','/introduction','INTRODUCTION, La Domus |라 도무스|는 ''로마시대 중정(중庭)이 있는 귀족의 집''이라는 뜻의 라틴어 ''Domus''에서 따온 것으로 품격있고 우아하지만 정감 있는 웨딩의 공간을 상징합니다.',
  '2025-04-04 23:01:13','2025-04-06 14:22:31','page',NULL,0,'default'),
 (3,'라 도무스 아트센터','/introduction/ladomus','라 도무스 아트센터는 국내 최대 규모의 웨딩홀로 자리 잡는 만큼 채플웨딩, 하우스웨딩을 넘어 자연과 예술을 향유하는 소통의 공간이자 웨딩의 새로운 가능성을 여는 창조적인 문화공간으로 다가갑니다.',
  '2025-04-04 23:09:42','2025-04-05 23:10:42','page',2,2,'default'),
 (4,'특별함','/introduction/ladomus2','워딩홀, 뷔페 및 연회장, 주차공간 고급스럽고 웅장한 유럽풍의 채플 웨딩 감성 웨딩홀 예식 홀마다 단독으로 사용 가능한 넓은 연회장으로 여유있는 식사 제공, 웨딩홀 단독 건물로 주차시간의 제한이 없음',
  '2025-04-04 23:24:30','2025-04-05 23:10:42','page',2,0,'default'),
 (5,'오시는 길','/introduction/ladomus3','대전광역시 유성구 동서대로 639 (원신흥동 578-6) Tel. 042-823-5220  유성IC  유성IC삼거리에서 ''공주, 계룡산'' 방면 좌회전 후 직진 → ''서대전,유성'' 방면 좌회전 후 직진 → 구암역삼거리 좌회전 → 유성온천역사거리 우회전 → 도안고등학교 → 목원대사거리 우회전 500M  지하철+버스  유성온천역 6번 출구 → 106번, 706번 중 승차 → 106번 흥도초 하차, 706번 등기소/아이파크시티 하차 → 목원대사거리 우측방향 500M 도보',
  '2025-04-04 23:25:38','2025-04-05 23:10:42','page',2,1,'default'),
 (8,'WEDDING','/wedding','로비 아시시홀 라도무스홀 아트리움홀 루미니스홀 아모리움홀 신부대기실 폐백실 토탈샵 연회장 치엘로가든 부대시설',
  '2025-04-05 00:03:31','2025-04-05 23:10:28','page',NULL,1,'default'),
 (9,'로비','/wedding/lobby','이탈리아 대표 건축법 중의 하나인 아치(Arch)를 현대적으로 표현한 로비는 10m의 높은 천장과 이탈리아산 최고급 석재로 제작하여 오로지 유럽에서만 느낄 수 있는 아치의 웅장함과 성스러움을 재현하였습니다. 입구에서부터 고급스럽고 품격 있는 모습으로 여러분을 맞이합니다.',
  '2025-04-05 00:04:16','2025-04-05 00:04:16','page',8,0,'default');
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin','editor') NOT NULL DEFAULT 'user',
  `points` int(11) NOT NULL DEFAULT 0,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
 (1,'alice','alice@example.com','hashedPass123','admin',100,'Seoul','010-1234-5678','2025-04-04 17:53:59','2025-04-04 17:53:59'),
 (2,'admin','ladomus1@naver.com','$2b$10$6mBsjYxfh6MM3NK9OQ3/XecrsrceKO7VeA65l7Z.oXEFp54pghkE2','admin',0,NULL,NULL,'2025-04-04 19:04:35','2025-04-04 19:04:35');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/* Removed the line about SQL_NOTES, to avoid "Unknown system variable 'OLD_SQL_NOTES'" */

-- Dump completed on 2025-04-08 16:39:45
