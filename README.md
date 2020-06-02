# Установка

`npm i -g psdconv`

# Запуск
В командной строке выполняем `psdconv`  
берет psd файлы из места запуска ./

# Классы
Теперь есть возможность дописывать в имя слоя классы и атрибуты.  
Например: ``.BTN_3(data-state='1').fadeInLeft.dur500.del300``  
В качестве основного имени будет выбрано "BTN_3", приведено к нижнему регистру, получится "btn_3". Это имя будет присвоено элементу и картинке, остальное будет  модификаторами. В данном примере это даст эффект аналогичный:
``animation:  fadeInLeft .5s .3s both``