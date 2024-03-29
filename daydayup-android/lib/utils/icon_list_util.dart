import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:todo_list/i10n/localization_intl.dart';
import 'package:todo_list/json/task_icon_bean.dart';
import 'package:todo_list/utils/shared_util.dart';
import 'package:todo_list/utils/theme_util.dart';

class IconListUtil{
  static IconListUtil _instance;

  static IconListUtil getInstance(){
    if(_instance == null){
        _instance = IconListUtil._internal();
    }
    return _instance;
  }

  IconListUtil._internal();


  List<TaskIconBean> getDefaultTaskIcons(BuildContext context){
    return [
      TaskIconBean(
        taskName: IntlLocalizations.of(context).voiceInput,
        iconBean: IconBean.fromIconData(Icons.mic),
        colorBean: ColorBean.fromColor(MyThemeColor.coffeeColor)),
      TaskIconBean(
          taskName: IntlLocalizations.of(context).travel,
          iconBean: IconBean.fromIconData(Icons.drive_eta),
          colorBean: ColorBean.fromColor(MyThemeColor.darkColor)),
      TaskIconBean(
          taskName: IntlLocalizations.of(context).work,
          iconBean: IconBean.fromIconData(Icons.work),
          colorBean: ColorBean.fromColor(MyThemeColor.blueGrayColor)),
      TaskIconBean(
          taskName: IntlLocalizations.of(context).importIn,
          iconBean: IconBean.fromIconData(Icons.keyboard_tab),
          colorBean: ColorBean.fromColor(MyThemeColor.greenColor)),
      TaskIconBean(
          taskName: IntlLocalizations.of(context).textInput,
          iconBean: IconBean.fromIconData(Icons.create),
          colorBean: ColorBean.fromColor(MyThemeColor.cyanColor)),
      TaskIconBean(
          taskName: IntlLocalizations.of(context).photoInput,
          iconBean: IconBean.fromIconData(Icons.insert_photo),
          colorBean: ColorBean.fromColor(MyThemeColor.defaultColor)),

    ];
  }



  Future<List<TaskIconBean>> getIconWithCache(BuildContext context) async{

    List<String> strings =
        await SharedUtil.instance.readList(Keys.taskIconBeans);
    List<TaskIconBean> list = [];
    for (var o in strings) {
      final data = jsonDecode(o);
      TaskIconBean taskIconBean = TaskIconBean.fromMap(data);
      list.add(taskIconBean);
    }
    final hasSaveDefaultIcons = await SharedUtil.instance.getBoolean(Keys.hasSavedDefaultIcons) ?? false;
    List<TaskIconBean>  defaultList = [];
    if(!hasSaveDefaultIcons){
      defaultList = getDefaultTaskIcons(context);
      await SharedUtil.instance.saveBoolean(Keys.hasSavedDefaultIcons, true);
      List<String> defaultIcons = [];
      for (var defaultIcon in defaultList) {
        defaultIcons.add(jsonEncode(defaultIcon.toMap()));
      }
      await SharedUtil.instance.saveStringList(Keys.taskIconBeans, defaultIcons+ strings);
    }
    return List.from(defaultList + list);
  }
}