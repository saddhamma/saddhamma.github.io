"Publish translation and update pali.
:%s/Esteem for Dhamma/Esteem for Buddha/ge
:norm gg
/dq
:norm 8dd
:norm k
:r newmenu.list
:%s/dq/bq/ge
