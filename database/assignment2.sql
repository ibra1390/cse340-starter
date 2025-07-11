--Insert 'Tony Stark' into account table

INSERT INTO public.account (
	account_firstname, 
	account_lastname, 
	account_email, 
	account_password
)
VALUES (
	'Tony',
	'Stark',
	'tony@starkent.com',
	'Iam1ronM@n'
);

--Update 'Tony Stark' account type to 'Admin'

UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

--Delete 'Tony Stark' from database

DELETE FROM account
WHERE account_email = 'tony@starkent.com';

--Modify "GM Hummer" description, "small interiors" for "a huge interior"

UPDATE inventory 
SET inv_description = REPLACE(inv_description,'the small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Use Inner Join to select the make and model fields from the inventory table, and classification name from the classification table
-- for inventory items that belong to the "Sport" category

SELECT inv_make, inv_model, classification_name
FROM inventory
INNER JOIN classification
ON inventory.classification_id = classification.classification_id
WHERE classification_name = 'Sport';


--Update all records in the inventory table to add "/vehicles" to the middle of the file path
--in the inv_image and inv_thumbnail columns

UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');