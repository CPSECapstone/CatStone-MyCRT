CREATE TABLE Users(
   userId           INT AUTO_INCREMENT,
   userName         VARCHAR(64),
   email            VARCHAR(64),
   notificationLife INT,
   PRIMARY KEY (userId)
);

CREATE TABLE Notifications(
   notificationId      INT AUTO_INCREMENT,
   userId              INT,
   notificationMessage VARCHAR(64),
   timeActive          INT,
   PRIMARY KEY (notificationId),
   FOREIGN KEY (userId) references Users(userId)
);

CREATE TABLE Captures(
   captureId    INT AUTO_INCREMENT,
   userId       INT,
   captureAlias VARCHAR(64) UNIQUE,
   startTime    DATETIME,
   endTime      DATETIME,
   s3Bucket     VARCHAR(64),
   logFileName  VARCHAR(64),
   rdsInstance  VARCHAR(64),
   PRIMARY KEY (captureId),
   FOREIGN KEY (userId) references Users(userId)
);

CREATE TABLE Replays(
   replayId    INT AUTO_INCREMENT,
   userId      INT,
   captureId   INT,
   replayAlias VARCHAR(64) UNIQUE,
   rdsInstance VARCHAR(64),
   PRIMARY KEY (replayId),
   FOREIGN KEY (userId) references Users(userId),
   FOREIGN KEY (captureId) references Captures(captureId)
);

CREATE TABLE Metrics(
   metricId       INT AUTO_INCREMENT,
   captureAlias   VARCHAR(64),
   replayAlias    VARCHAR(64),
   s3Bucket       VARCHAR(64),
   metricFileName VARCHAR(64),
   PRIMARY KEY (metricId),
   FOREIGN KEY (captureAlias) references Captures(captureAlias),
   FOREIGN KEY (replayAlias) references Replays(replayAlias)
);
