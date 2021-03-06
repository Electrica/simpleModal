<?php

$settings = array();

$tmp = array(
    'active' => array(
        'xtype' => 'combo-boolean',
        'value' => false,
        'area' => 'simplemodal_main'
    ),
    'include_jquery' => array(
        'xtype' => 'combo-boolean',
        'value' => false,
        'area' => 'simplemodal_main'
    ),
    'themes' => array(
        'xtype' => 'textfield',
        'value' => '{assets_url}components/simplemodal/css/web/themes/simple.css',
        'area' => 'simplemodal_main'
    )
);

foreach ($tmp as $k => $v) {
    /* @var modSystemSetting $setting */
    $setting = $modx->newObject('modSystemSetting');
    $setting->fromArray(array_merge(
        array(
            'key' => 'simplemodal_' . $k,
            'namespace' => PKG_NAME_LOWER,
        ), $v
    ), '', true, true);

    $settings[] = $setting;
}

unset($tmp);
return $settings;