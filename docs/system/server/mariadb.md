---
layout: doc
title:  MariaDB
outline: 1
---
# ユーザー登録 & パスワード 再設定(root)

root のパスワード設定を忘れたりした場合には、他のユーザ登録もできなくなるので、忘れた場合の対処方法です。

## パスワード無しでrootログインする

はじめにMariaDBに保存されているパスワードを再設定するため、MariaDBにログインする必要があります。普段であればログインの際はパスワード入力を求められますが、今回はパスワード無しでログインできるようにします。

作業内容は一旦MariaDBを停止させてからパスワード入力をスキップさせる設定を追加します。その後MariaDBを起動させます。以下はその作業コマンドです。

<pre>
$ sudo systemctl stop mariadb
$ sudo systemctl set-environment MYSQLD_OPTS=<span style="color:crimson;">"--skip-grant-tables"</span>
$ sudo systemctl start mariadb
</pre>

## パスワードを再設定する

MariaDBにログインしたら、alter文を用いてパスワード再設定します。
以下のコマンドはパスワード再設定の入力例です。

<pre>
alter user <span style="color:crimson;">'root'</span>@<span style="color:crimson;">'localhost'</span> identified by <span style="color:crimson;">'新しいrootパスワード'</span>;
</pre>
パスワードを再設定し終わったら一旦MariaDBからログアウトします。

## パスワード有りでログインする設定に戻す

続きまして、パスワード有りでログインする設定に戻します。
これをしておかないとパスワード無しでrootログインできてしまいますので、おすすめできません。

方法としては、MariaDBを停止させたのち、パスワード入力をスキップする設定を解除します。
その後でMariaDBを起動します。

```
$ sudo systemctl stop mariadb
$ sudo systemctl unset-environment MYSQLD_OPTS
$ sudo systemctl start mariadb
```



# XAMPP 環境でのバージョンアップ

XAMPP環境で、MariaDB のみをバージョンアップする

1. 各データベースを [mysqldump](#mysqldump) で、SQL バックアップ
1. [最新の安定バージョン ZIPファイルのダウンロード](https://mariadb.org/download/?t=mariadb&p=mariadb&r=11.0.0&os=windows&cpu=x86_64&pkg=zip&m=yamagata-university)
1. 解凍して、フォルダ名を mysqlに変更
1. 既存の xampp/mysql フォルダ名を変更 xampp/mysql_old
1. xampp/mysql/bin (新) に xampp/mysql_old/bin/my.ini をコピー
1. xampp/mysqlに data フォルダを作成
1. xampp/mysql_old/backup/*.* を xampp/mysql/data/ ディレクトリ（除くファイル）をコピー
1. mariadb を xamppより起動
1. [mysql] mysql_upgrade のコマンドを実行して、新バージョンにデータベースの環境を合わせる。（各データーベースにOKなどが表示される）<br>※時間がかかります phase 7/7 まで待ちましょう
1. mariadbを xamppにより停止
1. mysql_error.log の内容を消去
1. mariadbを xamppより起動
1. mysql_error.log の内容を確認、エラーが出ていれば、エラーを解決する(代表的なエラー下記)<br>MariaDB バージョンが記されているので確認
1. mysqldump で、各データベースをSQLで、リストア (データベースごとに時間がかかります)

## mysql_error  対応
### innodb_tables (innodb_index) doesn't exist
innodb_index doesn't exist 
[対応サイト](https://stackoverflow.com/questions/37856155/mysql-upgrade-failed-innodb-tables-doesnt-exist)
[日本語対応サイト](https://www.bunkei-programmer.net/entry/2014/08/25/230357)
1. Drop these tables from Mysql:<br>
innodb_index_stats innodb_table_stats slave_master_info slave_relay_log_info slave_worker_info


1. Delete *.frm and *.ibd files for the 5 tables above.

1. Create the tables by running the following queries:

```
CREATE TABLE `innodb_index_stats` (
  `database_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `table_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `index_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `stat_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `stat_value` bigint(20) unsigned NOT NULL,
  `sample_size` bigint(20) unsigned DEFAULT NULL,
  `stat_description` varchar(1024) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`database_name`,`table_name`,`index_name`,`stat_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin STATS_PERSISTENT=0;

CREATE TABLE `innodb_table_stats` (
  `database_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `table_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `n_rows` bigint(20) unsigned NOT NULL,
  `clustered_index_size` bigint(20) unsigned NOT NULL,
  `sum_of_other_index_sizes` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`database_name`,`table_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin STATS_PERSISTENT=0;

```

最後に、`mysql_upgrade` を行います (mysql サーバーを立ち上げた状態で、 xampp/mysql/bin/mysql_upgrade)
ただし、phpMYAdmin(5.1.3)のファイル関係がロックされ、使用できなくなりましたが、phpMyAdminは利用できます

自分の環境では、innodb_index_stas, innodb_table_stats だけに対応すればよかったです。
その他のテーブルの CREATE SQL は、[こちらを参照](https://bugs.mysql.com/file.php?id=19725&bug_id=67179&text=1)


###  [Warning] Failed to load slave replication ...Table 'mysql.gtid_slave_pos' doesn't exist in engine

これに関しては、スタート時に、値がセットされないだけなので、無視してよいエラーです【Warning】

![](images/xampp_mariadb.png)


# バックアップとリストア

データ移行の際は、mysqldumpを利用して、日常のバックアップは、すべてのデータベースをバックアップする mariadbbackupを利用するように、その目的ごとに、方法を切り替える。

## mysqldump

### バックアップ
mysqldump コマンドでデータベースダンプすることができます。
ダンプファイルには、CREATE TABLE, INSERT 等の SQL 文が含まれます。大量データがの場合はバックアップ・リストアに時間がかかることがありあります。
mysqlサーバーを起動する必要はありません

```
mysqldump -h localhost -u root -pパスワード データベース名 テーブル名... > dump.sql
mysqldump -h localhost -u root -pパスワード --databases データベース名... > dump.sql
mysqldump -h localhost -u root -pパスワード --all-databases > dump.sql

mysqldump -h localhost -u root -pパスワード --databases データベース名 \
--flush-logs --single-transaction --master-data=2 > dump.sql
```
- --databases<br>
指定したデータベースをダンプします。ダンプファイルに CREATE DATABASE 文も加えられます。
- --all-databases<br>
MariaDB システムで利用する mysql データベースも含め、すべてのデータベースをダンプします。ダンプファイルに CREATE DATABASE 文も加えられます。
- --flush-logs<br>
ダンプ前にログファイルをフラッシュします。
- --lock-all-tables<br>
ダンプ中全てのテーブルを書き込みロックします。ダンプ中のテーブルアクセスがロックされますが、無条件で一貫性が保たれたデータをダンプすることができます。
- --single-transaction<br>
ひとつのトランザクションとしてダンプします。対象データベースがすべて InnoDB であること、および、ダンプ中に CREATE TABLE, DROP TABLE, ALTER TABLE, TRUNCATE TABLE を実行しないことを条件に、一貫性が保たれたデータをダンプすることができます。--all-databases を使用する場合は、MariaDB が内部で使用している mysql データベースのテーブルが InnoDB ではなく、MyISAM や、その改良版である Aria であることに注意してください。
- --master-data=2<br>
ダンプ開始時点のポジション情報をコメントとして出力します。レプリケーションやバイナリログからのロールフォワードに役立ちます。

### リストア

バックアップをリストアするには、ダンプファイルを単に SQL 文として実行します。

```
mysql -h localhost -u root -pパスワード < dump.sql
```

## mariabackup 

[参考サイト](https://www.tohoho-web.com/ex/mysql-mariabackup.html)

### バックアップ
```
mariabackup --backup -u root -pパスワード --target-dir I:\xampp\mysql\data\backup
```
バックアップ中は FLUSH TABLES WITH READ LOCK で全テーブルがロックされます

一貫性の確認
--prepare オプションで、バックアップデータの一貫性が保たれているかチェックすることができます。

<pre>
# mariabackup --prepare --target-dir /tmp/backup
  :
191208 03:16:33 <span style="color:crimson;">completed OK!</span>
</pre>

### リストア
```
# systemctl stop mariadb
# rm -rf /var/lib/mysql/*
# mariabackup --copy-back --target-dir /tmp/backup
# chown -R mysql:mysql /var/lib/mysql/*
# systemctl start mariadb
```

xampp
```
I:\xampp\mysql\data 削除
mariabackup --copy-back --target-dir I:\xampp\mysql\data\backup
```

## phpMyAdmin を利用

[【MySQL】phpMyadminのバックアップ＆復元方法【データベース管理は必須】](https://tatuking.com/phpmyadmin-backup/)

### バックアップ

1. phpMyadmin 
  ![](./images/MariaDB/phpmyadminbackup1.jpg)

1. 「Export」をクリック
  ![](./images/MariaDB/phpmyadminbackup2.jpg)

  Quick：全てのデータベースをサクッとバックアップしたい時に使用  
  Custom：特定のデータベースのみの時や、形式を選択したいときに使用  

zipファイルがダウンロードされれば終了

### リストア

1. 手順①：復元対象のデータベースを削除
  ![](./images/MariaDB/phpmyadminrestore1.jpg)

1. 「Import」をクリック
1. バックアップしたファイルを選択
1. 「go」をクリックして復元します

# データベース 特権付与

基本的にデータベース作成は、rootでないと行えないようにして、データベースを作成してから、アクセス権の付与を行います。  
(セキュリティの観点から)


```ini

MariaDB [(none)]>GRANT ALL PRIVILEGES ON `personal`.* TO www;

```

# データベースの名前変更

## dumpしてデータベースの名前を変更する

1. 新しいデータベースを作成
```
mysql> CREATE DATABASE new_db;
```
2. 変更したいデータベースをmysqldumpコマンドで、データベースをエクスポートします
```
$ mysqldump -u root -p -D old_db > /..../old_db.dump
```
3. データベースがエクスポートできたら、新しい名前のデータベースにインポートします
```
$ mysql -u root -p -d new_db < /var/tmp/old_db.dump
```
4. 新しいデータベースが問題なければ古いデータベースは削除します
```
mysql> DROP DATABASE old_db;
```

## RENAME TABLE コマンドを利用してリネームする

書式：<span style="color:crimson;">RENAME TABLE old_db.table TO new_db.table</span>

1. 新しいデータベースを作成
```cmd
mysql> CREATE DATABASE new_db;
```

2. 新しいデータベースに移動して、下記のようにRENAME TABLEコマンドで変更します
```cmd
mysql> use new_db;
mysql> RENAME TABLE
  old_db.table1 TO new_db.table1,
  old_db.table2 TO new_db.table2,
  old_db.table3 TO new_db.table3,
#  以下必要なだけリネームするテーブル名を繋げていきます

```
3. 新しいデータベースで問題なければ古いデータベースを削除します
```cmd
mysql> DROP DATABASE old_db;
```

データベースのエクスポート・インポートを実施しないので、時間的は速く実施できます


# エラー対策

## MariaDB サーバーエラー

[エラー対策](#mysql_error-対応)

## Ignoring data file ... exists with the same ...
```cmd
 2023-02-16  7:20:50 0 [Note] InnoDB: Ignoring data file './personal/#sql-alter-19e8-3.ibd' with space ID 92. Another data file called ./personal/examination_exercise.ibd exists with the same space ID.
 
Please try to optimize and repair these tables with PhpMyAdmin.
phpMyAdminで、該当のテーブルを選択して、最適化を行うと直りました。
```

## Databaseが削除できない

DROP DATABASE ... で、databaseが削除できない場合は、そのデータベースのフォルダは残して、フォルダの中身をすべて削除してから行います。
phpMyAdmin で使用中と表示されている場合が多い。

# テーブル操作


## テーブル名変更する

ALTER TABLE [IF EXISTS] tbl_name RENAME new_tbl_name

## AUTO_INCREMENT 操作

1. AUTO_INCREMENT 属性を削除するALTER TABLEを実行。（カラム定義からAUTO_INCREMENTを除く）
ALTER TABLE samples MODIFY id int(11) NOT NULL

1. PROIMARY KEY 属性を削除するALTER TABLEを実行。
ALTER TABLE samples DROP PRIMARY KEY
これでプライマリーキーが外せた。
この状態になればカラムに対して自由自在に変更を加えることができるようになる。
カラムに対して何らかの処理や修正を行い、またAUTO_INCREMENTやプライマリーキーをつけたい場合は、次の手順を実行する。

1. AUTO_INCREMENT 属性が追加されたALTER TABLEを実行。（カラム定義にAUTO_INCREMENTを含める）
ALTER TABLE samples MODIFY id int(11) AUTO_INCREMENT NOT NULL PRIMARY KEY
カラムに重複がなければこれで元の状態に戻る。

1. AUTO_INCREMENT 値のリセット
ALTER TABLE samples AUTO_INCREMENT 1; // 1にセットされます。
すべてのデータを削除してからリセットで1にするべきです。

## AUTO_INCREMENT を利用した PRIMARY KEYの設定

1. すでにプライマリー気があれば削除
```sql
ALTER TABLE <table> DROP PRIMARY KEY
```

1. 目的のコラムにPrimary Keyを付与 （AUTO_INCREMENTで、値が書き換えられます）
```sql
ALTER TABLE <table> MODIFY [target-column] INT AUTO_INCREMENT PRIMARY KEY 
```

## LAST_INSERT_ID() Primary Key AUTO_INCREMENT

LAST_INSERT_ID() SQL 関数または mysql_insert_id() CAPI 関数を使用して、自動的に生成された最新の AUTO_INCREMENT 値を取得できます。 

これらの関数は<span style="color:crimson;">接続に固有の関数であるため、別の接続が同様に挿入を実行していても、<u>戻り値は影響を受けません</u></span>。

```sql
INSERT INTO table (PrimaryKeyId, data)
VALUES (LAST_INSERT_ID(),data.value)
ON DUPLICATE KEY UPDATE data=VALUES(data);
```

## CSVファイルからのデータインポート

### CSVファイルの行頭に表題がある場合

1行目をスキップ IGNORE 1 LINES

<pre>
LOAD DATA LOCAL INFILE "file.csv"
INTO TABLE import_table
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
</pre>

LOAD DATA LOCAL INFILE の LOCAL というのは、mysqlが動いているサーバではなく、クライアント側のファイルを指定するという意味です。 
LOCAL を指定しなLい場合（つまり LOAD DATA INFILEの場合）はmysqlサーバ上のファイルを指定することになります。
しかも /var/lib/mysql など特定の場所からの相対パスであることを想定する必要があります（mysqldの設定による）。

### 特定列を指定

CSVの列指定は、 @1, @3, @6 とかで、列位置指定
MariaDB側で、マッピング
SET
JIS_ORG = @1,
ZIP_ORG = @3,
K_NAME = @9,

<pre>
LOAD DATA LOCAL INFILE '/????/?????.csv'
INTO TABLE mst_zip
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
(@1, @2, @3, @4, @5, @6, @7, @8, @9, @10, @11, @12, @13, @14, @15)
SET 
JIS_ORG = @1,
ZIP_ORG = @3,
K_NAME = @9,
H_NAME_ORG = @6,
K_JIS = @8,
H_JIS_ORG = @5
;
</pre>

※データ抽出側で、必要のフィールドだけ、移行先のテーブルに合わせて、抽出して、インポートするやり方のほうが、簡単です。

### sqlによるデータインポート

sqlファイルを利用して、データをインポートします。

事前確認
- Windowsコンソールから実行する際に、コンソールの<span style="text-decoration:underline;color:crimson;">必ず</span>文字コードの変更をしておく
  (ファイルインポート時に、エラーが文字化けするので、その対応です）
- 大規模データを読み込む際に、MariaDB packetの容量を大きくしていないと<br> 『server has gone away』のエラーが出ます
構成ファイル(my.ini)の変更を確認(デフォルト1M）
  max_allowed_packet=1M　--> 20M (my.ini)



<pre>
> chcp 65001

$ mysql -u root
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 4
Server version: 10.6.11-MariaDB mariadb.org binary distribution

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

$ MariaDB[root] > use [データベース];
$ MariaDB[root] > source [sqlファイル];

</pre>

## CSV ファイルにデータをエクスポート

### データのみのエクスポート

※ ファイルの場所には、スラッシュ(/)を用いること
```sql
SELECT *
INTO OUTFILE 'c:/Users/takem/Downloads/outputfile.csv'
CHARACTER SET 'utf8'
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
FROM account_journal WHERE title_id=970 ORDER BY journal_date

```

### 列名も同時エクスポート

列名は、エクスポート時に命名できます

```sql
SELECT *
INTO OUTFILE 'c:/Users/takem/Downloads/outputfile.csv'
CHARACTER SET 'utf8'
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
FROM ( 
SELECT '仕訳番号','日付','勘定科目','opponent_title_id','journal_summary','debit_amount','credit_amount'
UNION
SELECT journal_number,journal_date,title_id,opponent_title_id,journal_summary,debit_amount,credit_amount
FROM account_journal WHERE title_id=970 ORDER BY journal_date
) temp_table;
```

## TableA の値を TableB の値で更新する

[こちらのサイト](https://bashalog.c-brains.jp/13/07/24-144156.php)を参考にさせていただきました

まず、TabelA の内容を TableB の内容にする方法です。

例えば、TableA の name というフィールドの値を、TableB のうち同じ id を持つレコードの name で上書きしたいとします。
ちなみに、id は一意の前提です。その場合、流す UPDATE 文は単純。

<pre>
UPDATE TableA, TableB 
SET TableA.name = TableB.name 
WHERE TableA.id = TableB.id;
</pre>

これで、同じ id のレコードの name で更新されました。

TableA に属する TableB の値を、TableA が属する TableC の値で更新する
次に応用編。見出しはちょっとわかりづらい表現になっちゃいました。

例えば、Users というテーブルがあり、そこの1レコードである User が所有する情報 Infos というテーブルがあるとします。そして逆に、 User が属する Companies というテーブルがあるとします。
それぞれの紐付けは Infos.user_id と Users.id 、Users.company_id と Companies.id という感じでつながってるとします。

![](https://bashalog.c-brains.jp/images/130724_kimoto_01.png)

この時に、Infos の name というフィールドを、所有者が所属している Companies の name で上書きしたい場合を考えます。

この場合、Infos と Companies の間に直接的な接点がないため、先ほどのような単純な文ではいけません。
しかし、先ほどの TableB の部分に SELECT 文を使って Infos.id と Companies.name の組み合わせ持ってくることで実現できます。

まずは準備としてデータ取得の SQL 文を考えてみます。

<pre>
SELECT Infos.id AS id, Companies.name AS name
FROM Infos 
LEFT JOIN Users ON Infos.user_id = Users.id
LEFT JOIN Companies ON Users.company_id = Companies.id;
</pre>

Infos、Users、Companies を JOIN でつなげて、Infos.id と Companies.name の組み合わせでデータを持ってきました。
では、これを先ほどの UPDATE 文に入れ込んでいきましょう。

<pre>
UPDATE Infos, 
(SELECT Infos.id AS id, Companies.name AS name FROM Infos LEFT JOIN Users ON Infos.user_id = Users.id LEFT JOIN Companies ON Users.company_id = Companies.id) AS Com
SET Infos.name = Com.name 
WHERE Infos.id = Com.id;
</pre>

これで目的の上書きができました。

この、複数テーブルにまたがって UPDATE を行うやり方をついつい忘れがちなので、自分用も兼ねて書いてみました。
参考になれば幸いです。


## 取得するデータを表形式ではなくデータごとに分けて表示する

表形式ではなく、データごとに表示する場合は、最後に『&yen;G』をつける

<pre>
MariaDB [lefty]> SELECT * FROM merchandise_barcode WHERE barcode=83976<span style="color:crimson;font-weight:bold;">\G</span>
*************************** 1. row ***************************
                 barcode: 83976
          merchandise_id: 604724
       merchandise_title: [USA] AFRICAN SHEA BUTTER
       merchandise_color: BLACK
        merchandise_size: FS
        current_location: 999
           current_state: 21
       origin_sale_price: 3500.000
      current_sale_price: 1700.000
        merchandise_cost: NULL
              sale_price: 0.000
       consignment_state: 10
consignment_statement_no: 0
1 row in set (0.001 sec)
</pre>

# リモートアクセス設定

1. [firewallで、ポート(3306)を開ける(client)](#firewallでポート3306を開ける)
1. [アクセスユーザーの追加 (Sever)](#アクセスユーザーの追加-sever)
1. [アクセスユーザーの追加 (client)](#アクセスユーザーの追加-client)
1. [データベースサーバー 接続テスト](#データベースサーバー-接続テスト)
1. [PHP データベース接続](#php-データベース接続)
1. 6.phpMyAdmin ログイン (192.168.100.21への接続)

## firewallで、ポート(3306)を開ける(Client)

サーバーを作る際に、手続きをしているので、基本的にポートは空いています。

```cmd
$ sudo fireall-cmd --list-all
....
```

開いていなければ、ポートを開けます(Only Server)
<span syle="color:skyblue;font-weight:bold;">※ローカルのデータベースにアクセスするときは、ローカルでも開けなければ、アクセスできません。</span>

```cmd
$sudo firewall-cmd --add-service=mysql
success
$sudo firewall-cmd --runtime-to-permanent
success  
```

備考
rich 書式で、Firewallをしていたので、192.168.100.12しか受付をしない例
```cmd
#systemctl status firewalld
● firewalld.service - firewalld - dynamic firewall daemon
   Loaded: loaded (/usr/lib/systemd/system/firewalld.service; enabled; vendor preset: enabled)
   Active: active (running) since 水 2021-11-17 17:42:57 JST; 5 days ago
     Docs: man:firewalld(1)
 Main PID: 10069 (firewalld)
   CGroup: /system.slice/firewalld.service
           mq10069 /usr/bin/python2 -Es /usr/sbin/firewalld --nofork --nopid
…
#firewall-cmd --permanent --zone=public --add-rich-rule="rule family="ipv4" source address="192.168.100.12" port protocol="tcp" port="3306" accept"
success
#systemctl stop firewalld
#systemctl start firewalld
```
これを削除して、上記のようにポートを開けなおしました。

```cmd
#firewall-cmd --permanent --zone=public --remove-rich-rule="rule family="ipv4" source address="192.168.100.12" port protocol="tcp" port="3306" accept"
```


## アクセスユーザーの追加 (Sever)

アクセスされる側にも、接続元でユーザー確認を行うので、アクセスする側にもユーザーを追加。

```sql
MariaDB [(none)] > CREATE USER 'www'@'%' IDENTIFIED BY 'wwwkey';
MariaDB [(none)] > SELECT user,host FROM mysql.user; 
+-------+-----------+ 
| User  | Host      | 
+-------+-----------+ 
| www   | %         | 
| mysql | localhost | 
| root  | localhost | 
+-------+-----------+
MariaDB [(none)] > GRANT ALL PRIVILEGES ON *.* TO 'www';
```

## アクセスユーザーの追加 (client)

```sql
MariaDB [(none)] > CREATE USER 'www' identified by 'wwwkey';
MariaDB [(none)] > SELECT user,host FROM mysql.user; 
+-------+-----------+ 
| User  | Host      | 
+-------+-----------+ 
| www   | %         | 
| mysql | localhost | 
| root  | localhost | 
+-------+-----------+
```

## データベースサーバー 接続テスト

```cmd
$ sudo mysql -h 192.168.100.??? -u www -pwwwkey
Welcome to the MariaDB monitor.  Commands end with ; or \g. 
Your MariaDB connection id is 51 
Server version: 10.4.22-MariaDB MariaDB Server 
Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others. 
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement. 
MariaDB [(none)]>
```

## PHP データベース接続

```php
$user   = "www"; 
$pass   = "wwwkey"; 
$host   = "192.168.100.21"; 
$dbname = "test"; 
$dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4"; 
try {   
  $pdo = new PDO($dsn,$user,$pass); 
} 
catch (PDOException $e) { 
  echo "接続失敗: " . $e->getMessage() . "\n"; 
  exit(); 
} 
echo "MariaDB 接続成功
"; 
echo $dsn."
";

```

## phpMyAdmin 設定

phpMyAdminをインストールしていれば、設定ファイルの変更

/etc/phpMyAdmin/config.inc.php
```php
$i++;
$cfg['Servers'][$i]['Host'] = '192.168.100.21'; //provide hostname localhostから変更
$cfg['Servers'][$i]['Host'] = "3306"; //port 設定されていないので、追加
```
# JSONを使う

[JSON を扱う](https://mariadb.com/ja/resources/blog/using-json-with-mariadb-server/)

# 正規表現置換

テーブルのコラムを正規表現を利用した置換

```ini
SELECT
-- 正規表現 2番目のグループのみを表示
-- 参考サイト https://runebook.dev/ja/docs/mariadb/regexp_replace/index
REGEXP_REPLACE(exam_question,'(<iframe.*/)(.*.pdf)(.*)','\\2')
FROM examination_past_questions
WHERE exam_id in (24,25);
```

[MariaDB 正規表現置換](https://runebook.dev/ja/docs/mariadb/regexp_replace/index)

personal データベースで、データを変更する際に利用しました

```ini
ALTER TABLE examination_past_questions
ADD COLUMN exam_pdf_question TEXT COMMENT '２次試験用問題PDF',
ADD COLUMN exam_pdf_answer TEXT COMMENT '２次試験用解答PDF'

-- UPDATEする前に SELECT分で、ちゃんと正規表現が抜き出せているかをチェック
UPDATE examination_past_questions
SET 
exam_pdf_question = REGEXP_REPLACE(exam_question,'(<iframe.*/)(.*.pdf)(.*)','\\2')
,exam_pdf_answer = REGEXP_REPLACE(exam_answer,'(<iframe.*/)(.*.pdf)(.*)','\\2')
WHERE exam_id in (24,25);
```

# SQL

## GROUP_CONCAT (MYSQL １対複数のLEFT JOINを1行で表示)

とても便利な機能で、使えそうです

[MYSQL １対複数のLEFT JOINを1行で表示できるようにする。](https://office-obata.com/report/memorandum/post-3548/)

FIND_IN_SETと一緒に使えば、応用が利きます

```SQL
SELECT A.*, GROUP_CONCAT(b.item)
FROM table A
LEFT OUTER JOJN table b
ON A.id=b.id
GROUP BY A.id HAVING FIND_IN_SET('B',GROUP_CONCAT(b.item))

```
GROUP_CONCAT のなかに、'B'が含まれる場合は、選びますということになります

SQL奥が深い


# Dynamic Columns (動的カラム)

動的列を使用すると、テーブル内の行ごとに異なる列のセットを格納できます。これは、列のセットを BLOB に保存し、それを操作するための小さな関数のセットを持つことで機能します。

通常の列を使用できない場合は、動的列を使用する必要があります。

典型的な使用例は、多くの異なる属性 (サイズ、色、重量など) を持つ可能性のあるアイテムを保存する必要があり、可能な属性のセットが非常に大きいか、事前に不明である場合です。その場合、属性を動的列に入れることができます。

[参考サイト](https://runebook.dev/ja/docs/mariadb/dynamic-columns/index)

## 動的列の基本

テーブルには、動的列のストレージとして使用される BLOB 列が必要です。

```sql
create table assets (
  item_name varchar(32) primary key, -- すべてのアイテムに共通の属性
  dynamic_cols  blob  -- 動的列はここに保存されます
);
```
作成後は、動的列関数を介して動的列にアクセスできます。

2 つの動的列を含む行を挿入します: color=blue、size=XL

```sql
INSERT INTO assets VALUES 
  ('MariaDB T-shirt', COLUMN_CREATE('color', 'blue', 'size', 'XL'));
```

動的な列を含む別の行を挿入します: color=black、price=500

```sql
INSERT INTO assets VALUES
  ('Thinkpad Laptop', COLUMN_CREATE('color', 'black', 'price', 500));
```

すべての項目に対して動的列「color」を選択します。

```sql
SELECT item_name, COLUMN_GET(dynamic_cols, 'color' as char) 
  AS color FROM assets;
+-----------------+-------+
| item_name       | color |
+-----------------+-------+
| MariaDB T-shirt | blue  |
| Thinkpad Laptop | black |
+-----------------+-------+
```

行に動的列を追加したり、行から動的列を削除したりすることができます。

```sql
-- 列を削除します。
UPDATE assets SET dynamic_cols=COLUMN_DELETE(dynamic_cols, "price") 
WHERE COLUMN_GET(dynamic_cols, 'color' as char)='black'; 

-- 列を追加します。
UPDATE assets SET dynamic_cols=COLUMN_ADD(dynamic_cols, 'warranty', '3 years')
WHERE item_name='Thinkpad Laptop';
```

すべての列をリストしたり、それらの値を JSON 形式で取得したりすることもできます。

```sql
SELECT item_name, COLUMN_LIST(dynamic_cols) FROM assets;
+-----------------+---------------------------+
| item_name       | COLUMN_LIST(dynamic_cols) |
+-----------------+---------------------------+
| MariaDB T-shirt | `size`,`color`            |
| Thinkpad Laptop | `color`,`warranty`        |
+-----------------+---------------------------+

SELECT item_name, COLUMN_JSON(dynamic_cols) FROM assets;
+-----------------+----------------------------------------+
| item_name       | COLUMN_JSON(dynamic_cols)              |
+-----------------+----------------------------------------+
| MariaDB T-shirt | {"size":"XL","color":"blue"}           |
| Thinkpad Laptop | {"color":"black","warranty":"3 years"} |
+-----------------+----------------------------------------+
```

## 動的列のリファレンス

### COLUMN_CREATE

```sql
COLUMN_CREATE(column_name, value [as type], [column_name, value 
  [as type]]...);
```

指定された列と値を格納する動的列 BLOB を返します。

戻り値は以下に適しています。

テーブルに収納する  

他の動的列関数を使用してさらに変更する
as type パーツでは、値のタイプを指定できます。  
ほとんどの場合、 MariaDB は値のタイプを推測できるため、これは冗長です。値の型が明らかでない場合は、明示的な型指定が必要になる場合があります。  
たとえば、リテラル '2012-12-01' にはデフォルトで CHAR 型があり、日付として保存するには '2012-12-01' AS DATE を指定する必要があります。  
詳細については、「 Datatypes 」セクションを参照してください。 MDEV-597 にも注意してください。

使用例：  

```sql
-- MariaDB 10.0.1+:
INSERT INTO tbl SET dyncol_blob=COLUMN_CREATE("column_name", "value");
```

### COLUMN_ADD

```sql
COLUMN_ADD(dyncol_blob, column_name, value [as type], 
  [column_name, value [as type]]...);
```

動的列を追加または更新します。

- dyncol_blob は、有効な動的列 BLOB (たとえば、 COLUMN_CREATE はそのような BLOB を返します) または空の文字列のいずれかである必要があります。
- column_name は、追加する列の名前を指定します。 dyncol_blob にこの名前の列がすでにある場合は上書きされます。
- value は列の新しい値を指定します。 NULL 値を渡すと、列が削除されます。
- as type はオプションです。タイプについては、「 #datatypes 」セクションを参照してください。  
戻り値は、変更後の動的列 BLOB です。

使用例：

```sql
-- MariaDB 10.0.1+:
UPDATE t1 SET dyncol_blob=COLUMN_ADD(dyncol_blob, "column_name", "value") 
WHERE id=1;
```

注: COLUMN_ADD() は通常の関数 ( CONCAT() と同様) であるため、テーブル内の値を更新するには UPDATE ... SET dynamic_col=COLUMN_ADD(dynamic_col, ....) パターンを使用する必要があります。

### COLUMN_GET

```sql
COLUMN_GET(dyncol_blob, column_name as type);
```

column_name as type では、読み取る動的列のデータ型を指定する必要があります。

これは直観に反するように思えるかもしれません。なぜ取得するデータ型を指定する必要があるのでしょうか? 動的列システムは、保存されているデータからデータ型を判断できないのでしょうか?

答えは、SQL は静的に型付けされた言語であるということです。SQL インタープリターは、クエリを実行する前にすべての式のデータ型を知っている必要があります (たとえば、プリペアド ステートメントを使用していて "select COLUMN_GET(...)" を実行する場合、プリペアド ステートメント API では、サーバーが読み取られる列のデータ型を事前にクライアントに通知する必要があります)クエリが実行され、サーバーは列の実際のデータ型を確認できます)。

### COLUMN_DELETE


```sql
COLUMN_DELETE(dyncol_blob, column_name, column_name...);
```

指定された名前の動的列を削除します。複数の名前を付けることができます。

戻り値は、変更後の動的列 BLOB です。

### COLUMN_EXISTS

```sql
COLUMN_EXISTS(dyncol_blob, column_name);
```

column_name という名前の列が dyncol_blob に存在するかどうかを確認します。「はい」の場合は 1 を返し、そうでない場合は 0 を返します。

### COLUMN_LIST

```sql
COLUMN_LIST(dyncol_blob);
```

列名のカンマ区切りリストを返します。名前はバッククォートで引用されます。

```sql
SELECT column_list(column_create('col1','val1','col2','val2'));
+---------------------------------------------------------+
| column_list(column_create('col1','val1','col2','val2')) |
+---------------------------------------------------------+
| `col1`,`col2`                                           |
+---------------------------------------------------------+
```

### COLUMN_CHECK

```sql
COLUMN_CHECK(dyncol_blob);
```

yncol_blob が有効なパックされた動的列 BLOB であるかどうかを確認します。戻り値 1 は BLOB が有効であることを意味し、戻り値 0 は BLOB が有効でないことを意味します。

理論的根拠: 通常、有効な動的列 BLOB を使用して動作します。 COLUMN_CREATE 、 COLUMN_ADD 、 COLUMN_DELETE のような関数は、常に有効な動的列 BLOB を返します。ただし、動的列 BLOB が誤って切り詰められたり、ある文字セットから別の文字セットにトランスコードされたりすると、破損します。この関数を使用すると、BLOB フィールドの値が有効な動的列 BLOB であるかどうかを確認できます。

注: COLUMN_CHECK が破損に気づかないように、切り捨てによって動的列 "clearly" が切り取られる可能性がありますが、切り捨ての場合は値の保存中に警告が発行されます。

### COLUMN_JSON

dyncol_blob 内のデータの JSON 表現を返します。

使用例:

```sql
SELECT item_name, COLUMN_JSON(dynamic_cols) FROM assets;
+-----------------+----------------------------------------+
| item_name       | COLUMN_JSON(dynamic_cols)              |
+-----------------+----------------------------------------+
| MariaDB T-shirt | {"size":"XL","color":"blue"}           |
| Thinkpad Laptop | {"color":"black","warranty":"3 years"} |
+-----------------+----------------------------------------+
```


制限事項: COLUMN_JSON は、深さ 10 レベル以下のネストされた動的列をデコードします。
10 レベルより深くネストされている動的列は、エンコードされずに BINARY 文字列として表示されます。


# 全文検索(Innodb) 

自分のパスワードや日記で、全文検索ができればよいのにと思って調べました。

下記の際のサイトがとても参考になりました、ようやくはこちらにコピペしています、もし説明など詳細を知りたければ、サイトを訪問。  

[全検索参考サイト](https://tech.s-mat.co.jp/mysql_fulltextindex)



## MySQLの全文検索

MySQLではFULLTEXT INDEXというINDEXが用意されており、これを利用することでLIKE検索と比較して、高速に対象のデータを抽出することができます。 
また、完全一致だけではなく類似する文章も合わせて検索し、該当率が高いレコードから返却してもらうことが可能です。

FULLTEXT INDEXについて

FULLTEXT INDEXは、MySQLに用意されているINDEXの一種で、テキストベースのカラム(CHAR,VARCHAR,TEXT)に指定することができるINDEXです。 
FULLTEXT INDEXを指定したテーブルに対して、全文検索関数を利用することで対象を抽出することができます。

FULLTEXT INDEXの指定については他のINDEXと同様に、テーブル作成時にCREATE TABLEで指定するか、  
ALTER TABLE・CREATE INDEXを利用して追加することができます。

```sql
# CREATE TABLE で指定した場合の例
CREATE TABLE `smartshopping_products` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `maker` varchar(255) DEFAULT NULL COMMENT 'メーカー名',
  `brand` varchar(255) DEFAULT NULL COMMENT 'ブランド名',
  `title` varchar(255) DEFAULT NULL COMMENT '商品名',
  `price` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '価格',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '更新日時',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '作成日時',
  PRIMARY KEY (`id`),
  FULLTEXT KEY `FT_Maker_Brand_Title` (`maker`,`brand`,`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='FULLTEXT INDEX用サンプルテーブル';
```

## 全文検索関数について

全文検索関数は、下記の構文を利用することで実行することができます。 
MATCHの部分には検索対象のカラムを指定し、AGAINSTには検索したいキーワードを指定します。 
MATCH (col1,col2...) AGAINST (expr [search_modifier])

※FULLTEXT INDEXで複数カラム指定している場合は、MATCHで全てのカラムを指定しないとエラーになるので注意です。

```sql
# SELECT * FROM [テーブル名] WHERE MATCH([fulltextIndexで指定した全てのカラム]) AGAINST([検索キーワード]);
SELECT * FROM smartshopping_products WHERE MATCH(`maker`,`brand`,`title`) AGAINST('炭酸水');
```

## 複数キーワードの場合

今回作成した商品検索などで、複数のキーワードに対応したい場合は下記の通りに指定することで対応することができます。

### OR検索

OR検索をしたい場合は、AGAINSTで指定するキーワードを半角スペース区切りで指定することで複数のキーワードに対応することができます。

```sql
SELECT * FROM smartshopping_products WHERE MATCH(`maker`,`brand`,`title`) AGAINST('炭酸水 レモン');
```

### AND検索

AND検索をしたい場合は、キーワードに少し追加が必要で、AGAINSTで指定するキーワードの前に「+」をつけることで対応することができます。

```sql
SELECT * FROM smartshopping_products WHERE MATCH(`maker`,`brand`,`title`) AGAINST('+炭酸水 +レモン');
```

### ANDとORどちらも利用する

最後に条件を複合で利用したい場合のパターンです。   
指定方法はAND検索、OR検索に書いたものと同じですが、まとめたい部分を括弧でまとめてあげる必要があります。  
下記の場合だと、サントリー又はアサヒが含まれている炭酸水又はレモンを含む商品が抽出されるイメージです。

```sql
SELECT * FROM smartshopping_products WHERE MATCH(`maker`,`brand`,`title`) AGAINST('+(サントリー アサヒ) +(炭酸水 レモン)');
```


